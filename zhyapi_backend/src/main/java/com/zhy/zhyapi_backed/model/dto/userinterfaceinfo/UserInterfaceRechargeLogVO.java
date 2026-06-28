package com.zhy.zhyapi_backed.model.dto.userinterfaceinfo;

import lombok.Data;
import java.util.Date;

@Data
public class UserInterfaceRechargeLogVO {
    private Long id;
    /** 操作管理员ID */
    private Long operateUserId;
    /** 操作管理员账号名（联表查询回填） */
    private String operateUserName;
    /** 被操作用户ID */
    private Long targetUserId;
    /** 被操作用户账号名（联表查询回填） */
    private String targetUserName;
    /** 接口ID */
    private Long interfaceInfoId;
    /** 接口名称（联表查询回填） */
    private String interfaceName;
    /** 变更次数 */
    private Integer changeNum;
    /** 操作前剩余次数 */
    private Integer beforeLeftNum;
    /** 操作后剩余次数 */
    private Integer afterLeftNum;
    /** 备注 */
    private String remark;
    /** 操作时间 */
    private Date createTime;
}