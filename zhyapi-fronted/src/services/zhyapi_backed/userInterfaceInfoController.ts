// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** 创建 POST /api/userInterfaceInfo/add */
export async function addUserInterfaceInfoUsingPost(
  body: API.UserInterfaceInfoAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>("/api/userInterfaceInfo/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除 POST /api/userInterfaceInfo/delete */
export async function deleteUserInterfaceInfoUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/userInterfaceInfo/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** getUserInterfaceInfoById GET /api/userInterfaceInfo/get/vo */
export async function getUserInterfaceInfoByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserInterfaceInfoByIdUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseUserInterfaceInfo_>(
    "/api/userInterfaceInfo/get/vo",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** listUserInterfaceInfoByPage POST /api/userInterfaceInfo/list/page */
export async function listUserInterfaceInfoByPageUsingPost(
  body: API.UserInterfaceInfoQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageUserInterfaceInfo_>(
    "/api/userInterfaceInfo/list/page",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** getMyInterfaceInfo GET /api/userInterfaceInfo/my/get */
export async function getMyInterfaceInfoUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMyInterfaceInfoUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseUserInterfaceInfo_>(
    "/api/userInterfaceInfo/my/get",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** listMyUserInterfaceInfo POST /api/userInterfaceInfo/my/list */
export async function listMyUserInterfaceInfoUsingPost(
  body: API.UserInterfaceInfoQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageUserInterfaceInfo_>(
    "/api/userInterfaceInfo/my/list",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 批量用户充值接口调用次数 POST /api/userInterfaceInfo/recharge/batch */
export async function batchRechargeInterfaceCountUsingPost(
  body: API.UserInterfaceInfoRechargeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>(
    "/api/userInterfaceInfo/recharge/batch",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** 查询次数变更流水记录 POST /api/userInterfaceInfo/recharge/log/list */
export async function listRechargeLogUsingPost(
  body: API.UserRechargeLogQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageUserInterfaceRechargeLogVO_>(
    "/api/userInterfaceInfo/recharge/log/list",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}

/** updateUserInterfaceInfo POST /api/userInterfaceInfo/update */
export async function updateUserInterfaceInfoUsingPost(
  body: API.UserInterfaceInfoUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/userInterfaceInfo/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
