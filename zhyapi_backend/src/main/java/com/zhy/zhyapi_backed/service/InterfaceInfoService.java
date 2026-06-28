package com.zhy.zhyapi_backed.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhyapi.common.model.entity.InterfaceInfo;


/**
 * 接口信息服务
 *
 * @author <a href="https://github.com/dongzhy">程序员zhy</a>
 */
public interface InterfaceInfoService extends IService<InterfaceInfo> {

    void validInterfaceInfo(InterfaceInfo interfaceInfo, boolean add);
}
