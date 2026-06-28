package com.zhy.zhyapigateway;
import com.zhy.zhyapiclientsdk.utils.SignUtils;
import com.zhyapi.common.model.entity.InterfaceInfo;
import com.zhyapi.common.model.entity.User;
import com.zhyapi.common.service.InnerInterfaceInfoService;
import com.zhyapi.common.service.InnerUserInterfaceInfoService;
import com.zhyapi.common.service.InnerUserService;
import lombok.extern.slf4j.Slf4j;
import org.apache.dubbo.config.annotation.DubboReference;
import org.reactivestreams.Publisher;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferFactory;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

/**
 * 全局过滤
 */
@Slf4j
@Component
public class CustomGlobalFilter implements GlobalFilter, Ordered {
    @DubboReference
    private InnerUserService innerUserService;

    @DubboReference
    private InnerInterfaceInfoService innerInterfaceInfoService;

    @DubboReference
    private InnerUserInterfaceInfoService innerUserInterfaceInfoService;

    private static final List<String> IP_WHITE_LIST = Arrays.asList("127.0.0.1");
    private static final String INTERFACE_HOST ="http://localhost:8123";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = INTERFACE_HOST+request.getPath();
        String method = Objects.requireNonNull(request.getMethod()).toString();

        log.info("请求唯一标识：{}", request.getId());
        log.info("请求路径：{}", request.getPath().value());
        log.info("请求方法：{}", request.getMethod());
        log.info("请求参数：{}", request.getQueryParams());
        // 修复：取远程客户端IP
        String sourceAddress = Objects.requireNonNull(request.getRemoteAddress()).getHostString();
        log.info("请求来源地址：{}", sourceAddress);
        ServerHttpResponse response = exchange.getResponse();

        // 黑白名单
        if (!IP_WHITE_LIST.contains(sourceAddress)) {
            log.error("IP不在白名单：{}", sourceAddress);
            return handleNoAuth(response);
        }

        // 获取鉴权头
        HttpHeaders headers = request.getHeaders();
        String accesskey = headers.getFirst("accesskey");
        String nonce = headers.getFirst("nonce");
        String timestamp = headers.getFirst("timestamp");
        String sign = headers.getFirst("sign");
        String body = headers.getFirst("body");

        // 1. accesskey为空直接拦截
        if (accesskey == null) {
            return handleNoAuth(response);
        }

        User invokeUser = null;
        try{
            invokeUser = innerUserService.getInvokeUser(accesskey);
        }catch (Exception e){
            log.error("调用Dubbo获取用户失败：",e);
            return handleNoAuth(response);
        }
        if (invokeUser == null){
            log.error("accesskey无对应用户");
            return handleNoAuth(response);
        }

        // nonce判空+校验
        if (nonce == null || Long.parseLong(nonce) > 10000L) {
            return handleNoAuth(response);
        }

        // 时间戳校验
        if (timestamp == null) {
            return handleNoAuth(response);
        }
        Long currentTime = System.currentTimeMillis()/1000;
        final Long FIVE_MINUTE = 60*5L;
        if ((currentTime - Long.parseLong(timestamp)) >= FIVE_MINUTE){
            return handleNoAuth(response);
        }

        // 签名校验，避免null.equals
        String secretkey = invokeUser.getSecretKey();
        String serverSign = SignUtils.getSign(body, secretkey);
        if (!Objects.equals(sign, serverSign)){
            log.error("签名不一致");
            return handleNoAuth(response);
        }

        // 接口查询
        InterfaceInfo interfaceInfo = null;
        try{
            interfaceInfo = innerInterfaceInfoService.getInterfaceInfo(path,method);
        }catch (Exception e){
            log.error("查询接口信息异常",e);
        }
        if (interfaceInfo == null){
            log.error("接口不存在");
            return handleNoAuth(response);
        }

        return handleResponse(exchange, chain, interfaceInfo.getId(), invokeUser.getId());
    }


    /**
     * 处理响应
     *
     * @param exchange
     * @param chain
     * @return
     */
    public Mono<Void> handleResponse(ServerWebExchange exchange, GatewayFilterChain chain, long interfaceInfoId, long userId) {
        try {
            ServerHttpResponse originalResponse = exchange.getResponse();
            // 缓存数据的工厂
            DataBufferFactory bufferFactory = originalResponse.bufferFactory();
            // 拿到响应码
            HttpStatus statusCode = originalResponse.getStatusCode();
            if (statusCode == HttpStatus.OK) {
                // 装饰，增强能力
                ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(originalResponse) {
                    // 等调用完转发的接口后才会执行
                    @Override
                    public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                        log.info("body instanceof Flux: {}", (body instanceof Flux));
                        if (body instanceof Flux) {
                            Flux<? extends DataBuffer> fluxBody = Flux.from(body);
                            // 往返回值里写数据
                            // 拼接字符串
                            return super.writeWith(
                                    fluxBody.map(dataBuffer -> {
                                        // 7. 调用成功，接口调用次数 + 1 invokeCount
                                        try {
                                            innerUserInterfaceInfoService.invokeCount(interfaceInfoId, userId);
                                        } catch (Exception e) {
                                            log.error("invokeCount error", e);
                                        }
                                        byte[] content = new byte[dataBuffer.readableByteCount()];
                                        dataBuffer.read(content);
                                        DataBufferUtils.release(dataBuffer);//释放掉内存
                                        // 构建日志
                                        StringBuilder sb2 = new StringBuilder(200);
                                        List<Object> rspArgs = new ArrayList<>();
                                        rspArgs.add(originalResponse.getStatusCode());
                                        String data = new String(content, StandardCharsets.UTF_8); //data
                                        sb2.append(data);
                                        // 打印日志
                                        log.info("响应结果：" + data);
                                        return bufferFactory.wrap(content);
                                    }));
                        } else {
                            // 8. 调用失败，返回一个规范的错误码
                            log.error("<--- {} 响应code异常", getStatusCode());
                        }
                        return super.writeWith(body);
                    }
                };
                // 设置 response 对象为装饰过的
                return chain.filter(exchange.mutate().response(decoratedResponse).build());
            }
            return chain.filter(exchange); // 降级处理返回数据
        } catch (Exception e) {
            log.error("网关处理响应异常" + e);
            return chain.filter(exchange);
        }
    }


    public int getOrder() {
        return -1;
    }
    public Mono<Void> handleNoAuth(ServerHttpResponse response){
        response.setStatusCode(HttpStatus.FORBIDDEN);
        return response.setComplete();
    }
    public Mono<Void> handleInvokeError(ServerHttpResponse response){
        response.setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR);
        return response.setComplete();
    }
}
