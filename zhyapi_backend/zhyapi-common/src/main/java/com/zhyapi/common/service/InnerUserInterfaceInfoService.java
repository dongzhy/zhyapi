package com.zhyapi.common.service;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zhyapi.common.model.entity.UserInterfaceInfo;

/**
* @author 15922
* @description 针对表【user_interface_info(用户调用接口关系表)】的数据库操作Service
* @createDate 2026-01-25 09:32:41
*/
public interface InnerUserInterfaceInfoService {
    /**
     * 调用接口统计
     * @param interfaceInfoId
     * @param userId
     * @return
     */
    boolean invokeCount(long interfaceInfoId, long userId);
}
