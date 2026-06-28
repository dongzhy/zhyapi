package com.zhy.zhyapi_backed.controller;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.google.gson.Gson;
import com.google.gson.JsonSyntaxException;
import com.zhy.zhyapi_backed.annotation.AuthCheck;
import com.zhy.zhyapi_backed.common.*;
import com.zhy.zhyapi_backed.constant.UserConstant;
import com.zhy.zhyapi_backed.exception.BusinessException;
import com.zhy.zhyapi_backed.exception.ThrowUtils;
import com.zhy.zhyapi_backed.model.dto.interfaceInfo.InterfaceInfoAddRequest;
import com.zhy.zhyapi_backed.model.dto.interfaceInfo.InterfaceInfoInvokeRequest;
import com.zhy.zhyapi_backed.model.dto.interfaceInfo.InterfaceInfoQueryRequest;
import com.zhy.zhyapi_backed.model.dto.interfaceInfo.InterfaceInfoUpdateRequest;
import com.zhy.zhyapi_backed.service.InterfaceInfoService;
import com.zhy.zhyapi_backed.service.UserInterfaceInfoService;
import com.zhyapi.common.model.entity.InterfaceInfo;
import com.zhy.zhyapi_backed.model.enums.InterfaceInfoStatusEnum;
import com.zhy.zhyapi_backed.service.UserService;
import com.zhy.zhyapiclientsdk.client.ZhyApiClient;
import com.zhyapi.common.model.entity.User;
import com.zhyapi.common.model.entity.UserInterfaceInfo;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 接口管理
 *
 * @author <a href="https://github.com/dongzhy">程序员zhy</a>
 */
@RestController
@RequestMapping("/interfaceInfo")
@Slf4j
public class InterfaceInfoController {

    @Resource
    private InterfaceInfoService interfaceInfoService;


    @Resource
    private UserInterfaceInfoService userInterfaceInfoService;

    @Resource
    private UserService userService;
    @Resource
    private ZhyApiClient zhyApiClient;

    /**
     * 创建
     *
     * @param interfaceInfoAddRequest
     * @param request
     * @return
     */
    @PostMapping("/add")
    @ApiOperation("创建")
    public BaseResponse<Long> addInterfaceInfo(@RequestBody InterfaceInfoAddRequest interfaceInfoAddRequest, HttpServletRequest request) {
        if (interfaceInfoAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        InterfaceInfo interfaceInfo = new InterfaceInfo();
        BeanUtils.copyProperties(interfaceInfoAddRequest, interfaceInfo);
        interfaceInfoService.validInterfaceInfo(interfaceInfo, true);
        User loginUser = userService.getLoginUser(request);
        interfaceInfo.setUserId(loginUser.getId());
        boolean result = interfaceInfoService.save(interfaceInfo);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        long newInterfaceInfoId = interfaceInfo.getId();
        // ========== 新增：初始化用户-接口关联记录 ==========
        UserInterfaceInfo userInterfaceInfo = new UserInterfaceInfo();
        userInterfaceInfo.setUserId(loginUser.getId());
        userInterfaceInfo.setInterfaceInfoId(newInterfaceInfoId);
        userInterfaceInfo.setTotalNum(0); // 初始总调用次数0
        userInterfaceInfo.setLeftNum(100); // 初始剩余次数（可配置，比如默认100次）
        userInterfaceInfo.setStatus(0); // 0-正常
        boolean initRel = userInterfaceInfoService.save(userInterfaceInfo);
        if (!initRel) {
            log.warn("初始化用户-接口关联记录失败，interfaceId:{}，userId:{}", newInterfaceInfoId, loginUser.getId());
             // 可选：抛出异常/仅日志，不影响接口创建
             throw new BusinessException(ErrorCode.OPERATION_ERROR, "初始化接口调用次数失败");
        }

        return ResultUtils.success(newInterfaceInfoId);
    }

    /**
     * 删除（逻辑删除）
     *
     * @param deleteRequest
     * @param request
     * @return
     */
    @ApiOperation("删除")
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteInterfaceInfo(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        // 判断是否存在
        InterfaceInfo oldInterfaceInfo = interfaceInfoService.getById(id);
        ThrowUtils.throwIf(oldInterfaceInfo == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldInterfaceInfo.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 逻辑删除（需在实体类添加 isDelete 字段，并配置 MyBatis-Plus 逻辑删除）
        InterfaceInfo interfaceInfo = new InterfaceInfo();
        interfaceInfo.setId(id);
        interfaceInfo.setIsDelete(1); // 1 表示已删除
        boolean b = interfaceInfoService.updateById(interfaceInfo);
        return ResultUtils.success(b);
    }

    /**
     * 更新（仅管理员）
     *
     * @param interfaceInfoUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateInterfaceInfo(@RequestBody InterfaceInfoUpdateRequest interfaceInfoUpdateRequest) {
        if (interfaceInfoUpdateRequest == null || interfaceInfoUpdateRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        InterfaceInfo interfaceInfo = new InterfaceInfo();
        BeanUtils.copyProperties(interfaceInfoUpdateRequest, interfaceInfo);
        // 参数校验
        interfaceInfoService.validInterfaceInfo(interfaceInfo, false);
        long id = interfaceInfoUpdateRequest.getId();
        // 判断是否存在
        InterfaceInfo oldInterfaceInfo = interfaceInfoService.getById(id);
        ThrowUtils.throwIf(oldInterfaceInfo == null, ErrorCode.NOT_FOUND_ERROR);
        boolean result = interfaceInfoService.updateById(interfaceInfo);
        return ResultUtils.success(result);
    }

    /**
     * 根据 id 获取（返回 VO）
     *
     * @param id
     * @return
     */
    @GetMapping("/get/vo")
    public BaseResponse<InterfaceInfo> getInterfaceInfoById(Long id, HttpServletRequest request) {
        if ( id == null || id <= 0 ) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        InterfaceInfo interfaceInfo = interfaceInfoService.getById(id);
        if (interfaceInfo == null ) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        // 转换为 VO（需自定义 InterfaceInfo 类，排除敏感字段）
        InterfaceInfo interfaceInfoVO = new InterfaceInfo();
        BeanUtils.copyProperties(interfaceInfo, interfaceInfoVO);
        return ResultUtils.success(interfaceInfoVO);
    }

    /**
     * 分页获取列表（仅管理员）
     *
     * @param interfaceInfoQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<InterfaceInfo>> listInterfaceInfoByPage(@RequestBody InterfaceInfoQueryRequest interfaceInfoQueryRequest) {
        long current = interfaceInfoQueryRequest.getCurrent();
        long size = interfaceInfoQueryRequest.getPageSize();
        // 分页参数校验
        if (current < 1) {
            current = 1;
        }
        if (size < 1 || size > 100) {
            size = 10; // 限制每页最大条数
        }
        // 构建查询条件
        QueryWrapper<InterfaceInfo> queryWrapper = new QueryWrapper<InterfaceInfo>();
        // 示例：根据接口名称模糊查询、根据状态精确查询
        if (StrUtil.isNotBlank(interfaceInfoQueryRequest.getName())) {
            queryWrapper.like("name", interfaceInfoQueryRequest.getName());
        }
        if (interfaceInfoQueryRequest.getStatus() != null) {
            queryWrapper.eq("status", interfaceInfoQueryRequest.getStatus());
        }
        // 按创建时间降序排列
        queryWrapper.orderByDesc("createTime");
        // 排除逻辑删除的数据
        queryWrapper.eq("isDelete", 0);

        Page<InterfaceInfo> interfaceInfoPage = interfaceInfoService.page(new Page<>(current, size), queryWrapper);
        return ResultUtils.success(interfaceInfoPage);
    }

    /**
     * 发布
     *
     * @param idRequest
     * @return
     */
    @PostMapping("/online")
    @AuthCheck(mustRole = "admin")
    public BaseResponse<Boolean> onlineInterfaceInfo(@RequestBody IdRequest idRequest, HttpServletRequest request) {

        if (idRequest == null || idRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);

        }
        Long id = idRequest.getId();
        // 判断是否存在
        InterfaceInfo oldInterfaceInfo = interfaceInfoService.getById(id);
        if (oldInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        //判断接口是否可调用
        com.zhy.zhyapiclientsdk.model.User user = new com.zhy.zhyapiclientsdk.model.User();
        user.setUsername("test");
        String username = zhyApiClient.getUserNameByPost(user);
        if (StringUtils.isBlank(username)) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "接口验证失败");
        }
        //仅本人或管理员调用
        InterfaceInfo interfaceInfo = new InterfaceInfo();
        interfaceInfo.setId(id);
        interfaceInfo.setStatus(InterfaceInfoStatusEnum.ONLINE.getValue());
        boolean result = interfaceInfoService.updateById(interfaceInfo);
        return ResultUtils.success(result);
    }

    /**
     * 下线
     *
     * @param idRequest
     * @return
     */
    @PostMapping("/offline")
    public BaseResponse<Boolean> offlineInterfaceInfo(@RequestBody IdRequest idRequest, HttpServletRequest request) {
        if (idRequest == null || idRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);

        }
        Long id = idRequest.getId();
        // 判断是否存在
        InterfaceInfo oldInterfaceInfo = interfaceInfoService.getById(id);
        if (oldInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        //仅本人或管理员调用
        InterfaceInfo interfaceInfo = new InterfaceInfo();
        interfaceInfo.setId(id);
        interfaceInfo.setStatus(InterfaceInfoStatusEnum.OFFLINE.getValue());
        boolean result = interfaceInfoService.updateById(interfaceInfo);
        return ResultUtils.success(result);
    }

    /**
     * 测试接口
     *
     * @param interfaceInfoInvokeRequest
     * @return
     */
    @PostMapping("/invoke")
// 方法名改回和业务匹配的，你之前误写成了offlineInterfaceInfo，不影响功能但建议规范
    public BaseResponse<Object> testInterfaceInfoInvoke(@RequestBody InterfaceInfoInvokeRequest interfaceInfoInvokeRequest, HttpServletRequest request) {
        // 1. 基础参数校验
        if (interfaceInfoInvokeRequest == null || interfaceInfoInvokeRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "接口ID不能为空且必须大于0");
        }
        Long id = interfaceInfoInvokeRequest.getId();
        String userRequestParams = interfaceInfoInvokeRequest.getUserRequestParams();

        // 2. 校验接口是否存在/是否在线
        InterfaceInfo oldInterfaceInfo = interfaceInfoService.getById(id);
        if (oldInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "目标接口不存在");
        }
        if (oldInterfaceInfo.getStatus() == InterfaceInfoStatusEnum.OFFLINE.getValue()) {
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "接口已关闭，无法调用");
        }

        // 3. 获取登录用户AK/SK，初始化SDK客户端
        User loginUser = userService.getLoginUser(request);
        ZhyApiClient tempClient = new ZhyApiClient(loginUser.getAccessKey(), loginUser.getSecretKey());
        Gson gson = new Gson();
        com.zhy.zhyapiclientsdk.model.User user = null;

        try {
            // 4. 容错解析JSON参数，避免解析失败抛异常
//            if (userRequestParams == null || userRequestParams.trim().isEmpty()) {
//                throw new BusinessException(ErrorCode.PARAMS_ERROR, "请求参数不能为空");
//            }
            user = gson.fromJson(userRequestParams, com.zhy.zhyapiclientsdk.model.User.class);
        } catch (JsonSyntaxException e) {
            log.error("JSON参数解析失败，参数内容：{}，错误：{}", userRequestParams, e.getMessage());
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "请求参数格式错误，必须是合法JSON（如{\"username\":\"test\"}）");
        }

        // 5. 调用SDK接口，增加异常捕获和结果校验
        String userNameByPost;
        try {
            // 调用第三方SDK接口
            userNameByPost = tempClient.getUserNameByPost(user);
            // 核心校验：判断返回结果是否是404错误页/空值/非法值
            if (userNameByPost == null || userNameByPost.trim().isEmpty()) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "调用第三方接口失败，返回结果为空");
            }
            if (userNameByPost.startsWith("<html>")) {
                log.error("调用第三方接口返回404错误页，返回内容：{}", userNameByPost);
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "调用第三方接口失败，目标服务接口不存在（404）");
            }
        } catch (Exception e) {
            // 捕获SDK内部的所有异常（如网络异常、请求超时、接口404等）
            log.error("调用第三方接口异常，请求参数：{}，错误：{}", gson.toJson(user), e.getMessage());
            throw new BusinessException(ErrorCode.SYSTEM_ERROR, "调用第三方接口失败：" + e.getMessage());
        }

        // 6. 正常返回结果
        return ResultUtils.success(userNameByPost);


    }
}
