package com.zhy.zhyapi_backed.model.dto.userinterfaceinfo;


import lombok.Data;

import java.io.Serializable;


/**
 * 创建请求
 *
 * @author <a href="https://github.com/dongzhy">程序员zhy</a>
 */
@Data
public class UserInterfaceInfoAddRequest implements Serializable {


    /**
     * 调用用户id
     */
    private Long userId;

    /**
     * 接口id
     */
    private Long interfaceInfoId;

    /**
     * 总调用次数
     */
    private Integer totalNum;

    /**
     * 剩余调用次数
     */
    private Integer leftNum;

}