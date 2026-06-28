package com.zhy.zhyapi_backed.model.vo;

import cn.hutool.json.JSONUtil;
import com.zhy.zhyapi_backed.model.entity.Post;
import com.zhyapi.common.model.entity.InterfaceInfo;
import lombok.Data;
import org.springframework.beans.BeanUtils;

import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * 接口信息封装试图
 *

 */
@Data
public class InterfaceInfoVO extends InterfaceInfo {
    /**
     * 接口调用次数
     */
    private Integer totalNum;




}
