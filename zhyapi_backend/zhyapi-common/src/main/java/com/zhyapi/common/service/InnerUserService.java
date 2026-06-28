package com.zhyapi.common.service;

import com.baomidou.mybatisplus.extension.service.IService;

import com.zhyapi.common.model.entity.User;


/**
 * 用户服务
 *
 * @author <a href="https://github.com/dongzhy">程序员zhy</a>
 */
public interface InnerUserService  {
    /**
     * 数据库中查是否已分配给用户密钥（accesskey,secretkey)
     * @param accessKey
     * @return
     */

    User getInvokeUser(String accessKey);

}
