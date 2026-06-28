package com.zhy.zhyapi_backed.controller;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhy.zhyapi_backed.annotation.AuthCheck;
import com.zhy.zhyapi_backed.common.*;
import com.zhy.zhyapi_backed.constant.UserConstant;
import com.zhy.zhyapi_backed.exception.BusinessException;
import com.zhy.zhyapi_backed.exception.ThrowUtils;
import com.zhy.zhyapi_backed.model.dto.userinterfaceinfo.*;
import com.zhy.zhyapi_backed.service.UserInterfaceInfoService;
import com.zhy.zhyapi_backed.service.UserService;
import com.zhy.zhyapiclientsdk.client.ZhyApiClient;
import com.zhyapi.common.model.entity.User;
import com.zhyapi.common.model.entity.UserInterfaceInfo;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;

/**
 * 接口管理
 *
 * @author <a href="https://github.com/dongzhy">程序员zhy</a>
 */
@RestController
@RequestMapping("/userInterfaceInfo")
@Slf4j
public class UserInterfaceInfoController {

    @Resource
    private UserInterfaceInfoService userInterfaceInfoService;


    @Resource
    private UserInterfaceInfoService userinterfaceInfoService;
    @Resource
    private UserService userService;

    /**
     * 创建
     *
     * @param userInterfaceInfoAddRequest
     * @param request
     * @return
     */
    @PostMapping("/add")
    @ApiOperation("创建")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Long> addUserInterfaceInfo(@RequestBody UserInterfaceInfoAddRequest userInterfaceInfoAddRequest, HttpServletRequest request) {
        if (userInterfaceInfoAddRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        UserInterfaceInfo userInterfaceInfo = new UserInterfaceInfo();
        BeanUtils.copyProperties(userInterfaceInfoAddRequest, userInterfaceInfo);
        userinterfaceInfoService.validUserInterfaceInfo(userInterfaceInfo, true);
        User loginUser = userService.getLoginUser(request);
        userInterfaceInfo.setUserId(loginUser.getId());
        boolean result = userinterfaceInfoService.save(userInterfaceInfo);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        long newUserInterfaceInfoId = userInterfaceInfo.getId();
        return ResultUtils.success(newUserInterfaceInfoId);
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
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteUserInterfaceInfo(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        // 判断是否存在
        UserInterfaceInfo oldUserInterfaceInfo = userinterfaceInfoService.getById(id);
        ThrowUtils.throwIf(oldUserInterfaceInfo == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldUserInterfaceInfo.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 逻辑删除（需在实体类添加 isDelete 字段，并配置 MyBatis-Plus 逻辑删除）
        UserInterfaceInfo userInterfaceInfo = new UserInterfaceInfo();
        userInterfaceInfo.setId(id);
        userInterfaceInfo.setIsDelete(1); // 1 表示已删除
        boolean b = userinterfaceInfoService.updateById(userInterfaceInfo);
        return ResultUtils.success(b);
    }

    /**
     * 更新（仅管理员）
     *
     * @param userInterfaceInfoUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateUserInterfaceInfo(@RequestBody UserInterfaceInfoUpdateRequest userInterfaceInfoUpdateRequest) {
        if (userInterfaceInfoUpdateRequest == null || userInterfaceInfoUpdateRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        UserInterfaceInfo userInterfaceInfo = new UserInterfaceInfo();
        BeanUtils.copyProperties(userInterfaceInfoUpdateRequest, userInterfaceInfo);
        // 参数校验
        userinterfaceInfoService.validUserInterfaceInfo(userInterfaceInfo, false);
        long id = userInterfaceInfoUpdateRequest.getId();
        // 判断是否存在
        UserInterfaceInfo oldUserInterfaceInfo = userinterfaceInfoService.getById(id);
        ThrowUtils.throwIf(oldUserInterfaceInfo == null, ErrorCode.NOT_FOUND_ERROR);
        boolean result = userinterfaceInfoService.updateById(userInterfaceInfo);
        return ResultUtils.success(result);
    }

    /**
     * 根据 id 获取（返回 VO）
     *
     * @param id
     * @return
     */
    @GetMapping("/get/vo")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<UserInterfaceInfo> getUserInterfaceInfoById(long id, HttpServletRequest request) {
        if (id <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        UserInterfaceInfo userInterfaceInfo = userinterfaceInfoService.getById(id);
        if (userInterfaceInfo == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        // 转换为 VO（需自定义 UserInterfaceInfo 类，排除敏感字段）
        UserInterfaceInfo userInterfaceInfoVO = new UserInterfaceInfo();
        BeanUtils.copyProperties(userInterfaceInfo, userInterfaceInfoVO);
        return ResultUtils.success(userInterfaceInfoVO);
    }

    /**
     * 分页获取列表（仅管理员）
     *
     * @param userInterfaceInfoQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<UserInterfaceInfo>> listUserInterfaceInfoByPage(@RequestBody UserInterfaceInfoQueryRequest userInterfaceInfoQueryRequest) {
        long current = userInterfaceInfoQueryRequest.getCurrent();
        long size = userInterfaceInfoQueryRequest.getPageSize();
        // 分页参数校验
        if (current < 1) {
            current = 1;
        }
        if (size < 1 || size > 100) {
            size = 10; // 限制每页最大条数
        }
        // 构建查询条件
        QueryWrapper<UserInterfaceInfo> queryWrapper = new QueryWrapper<UserInterfaceInfo>();
        // 示例：根据接口名称模糊查询、根据状态精确查询
        if (userInterfaceInfoQueryRequest.getStatus() != null) {
            queryWrapper.eq("status", userInterfaceInfoQueryRequest.getStatus());
        }
        // 按创建时间降序排列
        queryWrapper.orderByDesc("createTime");
        // 排除逻辑删除的数据
        queryWrapper.eq("isDelete", 0);

        Page<UserInterfaceInfo> userInterfaceInfoPage = userinterfaceInfoService.page(new Page<>(current, size), queryWrapper);
        return ResultUtils.success(userInterfaceInfoPage);
    }


    /**
     * 普通用户查询自己的接口调用额度
     * @param queryRequest
     * @param request
     * @return
     */
    @PostMapping("/my/list")
    public BaseResponse<Page<UserInterfaceInfo>> listMyUserInterfaceInfo(
            @RequestBody UserInterfaceInfoQueryRequest queryRequest,
            HttpServletRequest request) {
        User loginUser = userService.getLoginUser(request);
        long current = Math.max(queryRequest.getCurrent(), 1);
        long size = Math.min(queryRequest.getPageSize(), 20);
        QueryWrapper<UserInterfaceInfo> wrapper = new QueryWrapper<>();
        // 只能查自己的关联数据
        wrapper.eq("userId", loginUser.getId())
                .eq("isDelete", 0)
                .orderByDesc("createTime");
        Page<UserInterfaceInfo> page = userinterfaceInfoService.page(new Page<>(current, size), wrapper);
        return ResultUtils.success(page);
    }

    /**
     * 单条查看本人接口额度详情
     * @param interfaceId
     * @param request
     * @return
     */
    @GetMapping("/my/get")
    public BaseResponse<UserInterfaceInfo> getMyInterfaceInfo(Long interfaceId, HttpServletRequest request) {
        if (interfaceId == null || interfaceId <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User loginUser = userService.getLoginUser(request);
        QueryWrapper<UserInterfaceInfo> wrapper = new QueryWrapper<>();
        wrapper.eq("userId", loginUser.getId())
                .eq("interfaceInfoId", interfaceId)
                .eq("isDelete", 0);
        UserInterfaceInfo info = userinterfaceInfoService.getOne(wrapper);
        ThrowUtils.throwIf(info == null, ErrorCode.NOT_FOUND_ERROR, "暂无该接口调用权限");
        return ResultUtils.success(info);
    }



    /**
     * ③ 批量为多个用户充值同一接口调用次数（管理员）
     */
    @PostMapping("/recharge/batch")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    @ApiOperation("批量用户充值接口调用次数")
    public BaseResponse<Boolean> batchRechargeInterfaceCount(
            @RequestBody @Valid UserInterfaceInfoRechargeRequest rechargeRequest,
            HttpServletRequest request) {
        // 获取当前操作管理员
        User loginAdmin = userService.getLoginUser(request);
        List<Long> userIdList = rechargeRequest.getUserIdList();
        Long interfaceId = rechargeRequest.getInterfaceId();
        Integer addNum = rechargeRequest.getAddNum();
        String remark = rechargeRequest.getRemark();

        // 调用批量充值服务
        boolean result = userInterfaceInfoService.batchRecharge(
                userIdList, interfaceId, addNum, loginAdmin.getId(), remark);
        return ResultUtils.success(result);
    }



    /**
     * 查询充值/扣减流水记录（管理员对账）
     */
    @PostMapping("/recharge/log/list")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    @ApiOperation("查询次数变更流水记录")
    public BaseResponse<Page<UserInterfaceRechargeLogVO>> listRechargeLog(
            @RequestBody UserRechargeLogQueryRequest logQueryRequest) {
        long current = logQueryRequest.getCurrent();
        long size = Math.min(logQueryRequest.getPageSize(), 50);
        Page<UserInterfaceRechargeLogVO> logPage = userInterfaceInfoService.listRechargeLogPage(logQueryRequest, new Page<>(current, size));
        return ResultUtils.success(logPage);
    }


















}
