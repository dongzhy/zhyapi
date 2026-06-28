package com.zhy.zhyapi_backed.model.dto.userinterfaceinfo;

import lombok.Data;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.util.List;

@Data
public class UserInterfaceInfoRechargeRequest {
    /** 单用户充值用：用户ID */
    private Long userId;
    /** 批量充值用：用户ID集合 */
    @NotEmpty(message = "用户ID列表不能为空")
    private List<Long> userIdList;
    /** 接口ID */
    @NotNull(message = "接口ID不能为空")
    private Long interfaceId;
    /** 增加的调用次数 */
    @Min(value = 1, message = "充值次数必须大于0")
    @NotNull(message = "充值次数不能为空")
    private Integer addNum;
    /** 充值备注（后台管理员填写） */
    private String remark;
}