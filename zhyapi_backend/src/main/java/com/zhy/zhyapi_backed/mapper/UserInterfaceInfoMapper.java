package com.zhy.zhyapi_backed.mapper;


import com.baomidou.mybatisplus.core.mapper.BaseMapper;

import com.zhyapi.common.model.entity.UserInterfaceInfo;

import java.util.List;


/**
* @author 15922
* @description 针对表【user_interface_info(用户调用接口关系表)】的数据库操作Mapper
* @createDate 2026-01-25 09:32:41
* @Entity generator.domain.UserInterfaceInfo
*/
public interface UserInterfaceInfoMapper extends BaseMapper<UserInterfaceInfo> {


    List<UserInterfaceInfo> listTopInvokeInterfaceInfo(int limit);


}




