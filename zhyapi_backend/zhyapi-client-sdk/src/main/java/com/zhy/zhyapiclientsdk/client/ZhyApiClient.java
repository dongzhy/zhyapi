package com.zhy.zhyapiclientsdk.client;

import cn.hutool.core.util.RandomUtil;
import cn.hutool.http.HttpRequest;
import cn.hutool.http.HttpResponse;
import cn.hutool.json.JSONUtil;
import com.zhy.zhyapiclientsdk.model.User;
import java.util.HashMap;
import java.util.Map;
import static com.zhy.zhyapiclientsdk.utils.SignUtils.getSign;

/**
 * 调用第三方接口的客户端
 */
public class ZhyApiClient {
    // 网关地址可通过配置类注入，不写死硬编码
    private static final String GATEWAY_HOST = "http://localhost:8090";
    private final String accessKey;
    private final String secretKey;

    public ZhyApiClient(String accessKey, String secretKey) {
        this.accessKey = accessKey;
        this.secretKey = secretKey;
    }

    /**
     * 统一生成鉴权请求头
     * @param body JSON请求体，GET/表单传空字符串
     */
    private Map<String,String> getHeaderMap(String body){
        Map<String,String> hashMap = new HashMap<>();
        hashMap.put("accessKey", accessKey);
        hashMap.put("nonce", RandomUtil.randomNumbers(4));
        hashMap.put("timestamp",String.valueOf(System.currentTimeMillis()/1000));
        hashMap.put("body",body);
        hashMap.put("sign",getSign(body,secretKey));
        return hashMap;
    }

    // 修复：GET 请求增加鉴权头
    public String getNameByGet(String name){
        HashMap<String, Object> paramMap = new HashMap<>();
        paramMap.put("name", name);
        String emptyBody = "";
        Map<String,String> headers = getHeaderMap(emptyBody);
        HttpResponse response = HttpRequest.get(GATEWAY_HOST+"/api/name/")
                .addHeaders(headers)
                .form(paramMap)
                .execute();
        String result = response.body();
        System.out.println(result);
        return result;
    }

    // 修复：表单POST 增加鉴权头
    public String getNameByPost(String name){
        HashMap<String, Object> paramMap = new HashMap<>();
        paramMap.put("name", name);
        String emptyBody = "";
        Map<String,String> headers = getHeaderMap(emptyBody);
        HttpResponse response = HttpRequest.post(GATEWAY_HOST+"/api/name/post")
                .addHeaders(headers)
                .form(paramMap)
                .execute();
        String result = response.body();
        System.out.println(result);
        return result;
    }

    public String getUserNameByPost(User user) {
        // 将User对象转为JSON字符串
        String json = JSONUtil.toJsonStr(user);
        Map<String,String> headers = getHeaderMap(json);

        HttpResponse httpResponse = HttpRequest.post(GATEWAY_HOST+"/api/name/user")
                .charset("utf-8")
                .addHeaders(headers)
                .body(json)
                .execute();

        System.out.println("响应状态码：" + httpResponse.getStatus());
        String body = httpResponse.body();
        System.out.println(body);
        return body;
    }
}