package com.zhy.zhyapi_backed.model.dto.userinterfaceinfo;

import lombok.Data;

@Data
public class UserRechargeLogQueryRequest {
    /** 分页当前页 */
    private long current = 1;
    /** 分页每页条数 */
    private long pageSize = 10;
    /** 被操作用户ID筛选 */
    private Long targetUserId;
    /** 接口ID筛选 */
    private Long interfaceId;
    /** 开始时间 */
    private String startTime;
    /** 结束时间 */
    private String endTime;
}