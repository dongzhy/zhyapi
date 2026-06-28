package com.zhy.zhyapi_backed.service.impl;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhy.zhyapi_backed.common.ErrorCode;
import com.zhy.zhyapi_backed.exception.BusinessException;
import com.zhy.zhyapi_backed.exception.ThrowUtils;
import com.zhy.zhyapi_backed.mapper.UserInterfaceInfoMapper;
import com.zhy.zhyapi_backed.mapper.UserInterfaceRechargeLogMapper;
import com.zhy.zhyapi_backed.model.dto.userinterfaceinfo.UserInterfaceRechargeLogVO;
import com.zhy.zhyapi_backed.model.dto.userinterfaceinfo.UserRechargeLogQueryRequest;
import com.zhy.zhyapi_backed.model.entity.UserInterfaceRechargeLog;
import com.zhy.zhyapi_backed.service.InterfaceInfoService;
import com.zhy.zhyapi_backed.service.UserInterfaceInfoService;
import com.zhy.zhyapi_backed.service.UserService;
import com.zhyapi.common.model.entity.InterfaceInfo;
import com.zhyapi.common.model.entity.User;
import com.zhyapi.common.model.entity.UserInterfaceInfo;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
* @author 15922
* @description 针对表【user_interface_info(用户调用接口关系表)】的数据库操作Service实现
* @createDate 2026-01-25 09:32:41
*/
@Service
public class UserInterfaceInfoServiceImpl extends ServiceImpl<UserInterfaceInfoMapper,UserInterfaceInfo>
    implements UserInterfaceInfoService {
    @Resource
    private UserInterfaceRechargeLogMapper rechargeLogMapper;
    @Resource
    private UserService userService;
    @Resource
    private InterfaceInfoService interfaceInfoService;


    @Override
    public void validUserInterfaceInfo(UserInterfaceInfo userInterfaceInfo, boolean add) {

            if (userInterfaceInfo == null) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR);
            }
            // 创建时，所有参数必须非空
            if (add) {
                if (userInterfaceInfo.getInterfaceInfoId() <= 0 || userInterfaceInfo.getUserId() <= 0) {
                    throw new BusinessException(ErrorCode.PARAMS_ERROR, "接口或用户不存在");
                }
            }
            if (userInterfaceInfo.getLeftNum() < 0) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "剩余次数不能小于 0");
        }
    }

    @Override
    public boolean invokeCount(long interfaceInfoId, long userId) {
            // 判断
            if (interfaceInfoId <= 0 || userId <= 0) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR);
            }

            UpdateWrapper<UserInterfaceInfo> updateWrapper = new UpdateWrapper<>();
            updateWrapper.eq("interfaceInfoId", interfaceInfoId);
            updateWrapper.eq("userId", userId);

//        updateWrapper.gt("leftNum", 0);
            updateWrapper.setSql("leftNum = leftNum - 1, totalNum = totalNum + 1");
            return this.update(updateWrapper);
        }





    /**
     * 单用户充值
     */
    @Override
    public void singleRecharge(Long userId, Long interfaceId, Integer addNum, Long operateUserId, String remark) {
        // 1. 查询用户-接口关联记录
        LambdaQueryWrapper<UserInterfaceInfo> wrapper = Wrappers.lambdaQuery();
        wrapper.eq(UserInterfaceInfo::getUserId, userId)
                .eq(UserInterfaceInfo::getInterfaceInfoId, interfaceId)
                .eq(UserInterfaceInfo::getIsDelete, 0);
        UserInterfaceInfo record = this.getOne(wrapper);
        ThrowUtils.throwIf(record == null, ErrorCode.NOT_FOUND_ERROR, "该用户未开通此接口权限，无法充值");

        // 2. 记录变更前数值
        Integer beforeNum = record.getLeftNum();
        Integer afterNum = beforeNum + addNum;

        // 3. 更新剩余次数
        record.setLeftNum(afterNum);
        boolean update = this.updateById(record);
        ThrowUtils.throwIf(!update, ErrorCode.OPERATION_ERROR, "充值更新次数失败");

        // 4. 写入充值流水
        UserInterfaceRechargeLog log = new UserInterfaceRechargeLog();
        log.setOperateUserId(operateUserId);
        log.setTargetUserId(userId);
        log.setInterfaceInfoId(interfaceId);
        log.setChangeNum(addNum);
        log.setBeforeLeftNum(beforeNum);
        log.setAfterLeftNum(afterNum);
        log.setRemark(remark);
        log.setCreateTime(new Date());
        log.setIsDelete(0);
        rechargeLogMapper.insert(log);
    }

    /**
     * 批量用户充值同一接口
     */
    @Override
    public boolean batchRecharge(List<Long> userIdList, Long interfaceId, Integer addNum, Long operateUserId, String remark) {
        for (Long userId : userIdList) {
            try {
                singleRecharge(userId, interfaceId, addNum, operateUserId, remark + "【批量充值】");
            } catch (Exception e) {
                log.error("批量充值失败，用户ID:{}，接口ID:{}");
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "批量充值中断，用户ID:" + userId + "操作失败");
            }
        }
        return true;
    }

    @Override
    public Page<UserInterfaceRechargeLogVO> listRechargeLogPage(UserRechargeLogQueryRequest queryRequest, Page<UserInterfaceRechargeLog> page) {
        // 1. 构造查询条件
        QueryWrapper<UserInterfaceRechargeLog> wrapper = new QueryWrapper<>();
        if (queryRequest.getTargetUserId() != null) {
            wrapper.eq("targetUserId", queryRequest.getTargetUserId());
        }
        if (queryRequest.getInterfaceId() != null) {
            wrapper.eq("interfaceInfoId", queryRequest.getInterfaceId());
        }
        if (StrUtil.isNotBlank(queryRequest.getStartTime()) && StrUtil.isNotBlank(queryRequest.getEndTime())) {
            wrapper.between("createTime", queryRequest.getStartTime(), queryRequest.getEndTime());
        }
        wrapper.eq("isDelete", 0).orderByDesc("createTime");

        // 2. 分页查询流水原始数据
        Page<UserInterfaceRechargeLog> logEntityPage = rechargeLogMapper.selectPage(page, wrapper);
        List<UserInterfaceRechargeLog> logList = logEntityPage.getRecords();
        if (CollectionUtils.isEmpty(logList)) {
            // 无数据直接返回空分页
            Page<UserInterfaceRechargeLogVO> emptyVoPage = new Page<>(page.getCurrent(), page.getSize(), 0);
            emptyVoPage.setRecords(new ArrayList<>());
            return emptyVoPage;
        }

        // 3. 批量查询用户、接口名称（联表优化，避免循环单查DB）
        // 提取管理员ID、操作用户ID、接口ID
        List<Long> operateUserIdList = logList.stream().map(UserInterfaceRechargeLog::getOperateUserId).collect(Collectors.toList());
        List<Long> targetUserIdList = logList.stream().map(UserInterfaceRechargeLog::getTargetUserId).collect(Collectors.toList());
        List<Long> interfaceIdList = logList.stream().map(UserInterfaceRechargeLog::getInterfaceInfoId).collect(Collectors.toList());

        // 查询用户信息 map: userId -> userAccount
        Map<Long, String> userMap = userService.listByIds(Stream.concat(operateUserIdList.stream(), targetUserIdList.stream())
                        .distinct().collect(Collectors.toList()))
                .stream().collect(Collectors.toMap(User::getId, User::getUserAccount));
        // 查询接口信息 map: interfaceId -> interfaceName
        Map<Long, String> interfaceMap = interfaceInfoService.listByIds(interfaceIdList)
                .stream().collect(Collectors.toMap(InterfaceInfo::getId, InterfaceInfo::getName));

        // 4. 实体转VO，回填展示名称
        List<UserInterfaceRechargeLogVO> voList = logList.stream().map(log -> {
            UserInterfaceRechargeLogVO vo = new UserInterfaceRechargeLogVO();
            BeanUtils.copyProperties(log, vo);
            // 回填管理员账号
            vo.setOperateUserName(userMap.getOrDefault(log.getOperateUserId(), "未知用户"));
            // 回填被操作用户账号
            vo.setTargetUserName(userMap.getOrDefault(log.getTargetUserId(), "未知用户"));
            // 回填接口名称
            vo.setInterfaceName(interfaceMap.getOrDefault(log.getInterfaceInfoId(), "已删除接口"));
            return vo;
        }).collect(Collectors.toList());

        // 5. 组装VO分页对象返回
        Page<UserInterfaceRechargeLogVO> voPage = new Page<>(logEntityPage.getCurrent(), logEntityPage.getSize(), logEntityPage.getTotal());
        voPage.setRecords(voList);
        return voPage;
    }


}




