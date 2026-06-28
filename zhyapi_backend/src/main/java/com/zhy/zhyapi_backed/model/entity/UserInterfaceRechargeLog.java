package com.zhy.zhyapi_backed.model.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@TableName("userInterfaceRechargeLog") // 表名驼峰
@Data
public class UserInterfaceRechargeLog {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long operateUserId;
    private Long targetUserId;
    private Long interfaceInfoId;
    private Integer changeNum;
    private Integer beforeLeftNum;
    private Integer afterLeftNum;
    private String remark;
    private Date createTime;
    @TableLogic
    private Integer isDelete;
}