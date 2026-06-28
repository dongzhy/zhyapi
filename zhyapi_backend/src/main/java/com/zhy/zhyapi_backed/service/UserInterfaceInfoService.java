package com.zhy.zhyapi_backed.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhy.zhyapi_backed.model.dto.userinterfaceinfo.UserInterfaceRechargeLogVO;
import com.zhy.zhyapi_backed.model.dto.userinterfaceinfo.UserRechargeLogQueryRequest;
import com.zhy.zhyapi_backed.model.entity.UserInterfaceRechargeLog;
import com.zhyapi.common.model.entity.UserInterfaceInfo;

import java.util.List;

public interface UserInterfaceInfoService extends IService<UserInterfaceInfo> {




    void validUserInterfaceInfo(UserInterfaceInfo userInterfaceInfo, boolean add);

    /**
     * 调用接口统计
     * @param interfaceInfoId
     * @param userId
     * @return
     */
    boolean invokeCount(long interfaceInfoId, long userId);




    void singleRecharge(Long userId, Long interfaceId, Integer addNum, Long operateUserId, String remark);





    boolean batchRecharge(List<Long> userIdList, Long interfaceId, Integer addNum, Long operateUserId, String remark);




    Page<UserInterfaceRechargeLogVO> listRechargeLogPage(UserRechargeLogQueryRequest queryRequest, Page<UserInterfaceRechargeLog> page);






}
