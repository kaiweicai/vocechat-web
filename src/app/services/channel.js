import { createApi } from "@reduxjs/toolkit/query/react";
// import toast from "react-hot-toast";
import baseQuery from "./base.query";
import { ContentTypes } from "../config";
import { updateChannel, removeChannel } from "../slices/channels";
import { removeMessage } from "../slices/message";
import { removeChannelSession } from "../slices/message.channel";
import { removeReactionMessage } from "../slices/message.reaction";
import { onMessageSendStarted } from "./handlers";
export const channelApi = createApi({
  reducerPath: "channelApi",
  baseQuery,
  refetchOnFocus: true,
  endpoints: (builder) => ({
    getChannels: builder.query({
      query: () => ({ url: `group` }),
    }),
    getChannel: builder.query({
      query: (id) => ({ url: `group/${id}` }),
    }),
    createChannel: builder.mutation({
      query: (data) => ({
        url: "group",
        method: "POST",
        body: data,
      }),
    }),
    updateChannel: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `group/${id}`,
        method: "PUT",
        body: data,
      }),
      async onQueryStarted(
        { id, name, description },
        { dispatch, queryFulfilled }
      ) {
        // id: who send to ,from_uid: who sent
        const patchResult = dispatch(updateChannel({ id, name, description }));
        try {
          await queryFulfilled;
        } catch {
          console.log("channel update failed");
          patchResult.undo();
        }
      },
    }),
    getHistoryMessages: builder.query({
      query: ({ gid, mid = 0, limit = 50 }) => ({
        url: `/group/${gid}/history?before=${mid}&limit=${limit}`,
      }),
      // async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
      //   const {
      //     ui: { channelSetting },
      //     channelMessage,
      //   } = getState();
      //   try {
      //     await queryFulfilled;
      //     dispatch(removeChannel(id));
      //     if (id == channelSetting) {
      //       dispatch(toggleChannelSetting());
      //     }
      //     // 删掉该channel下的所有消息&reaction
      //     const mids = channelMessage[id];
      //     if (mids) {
      //       dispatch(removeChannelSession(id));
      //       dispatch(removeMessage(mids));
      //       dispatch(removeReactionMessage(mids));
      //     }
      //   } catch {
      //     console.log("remove channel error");
      //   }
      // },
    }),
    removeChannel: builder.query({
      query: (id) => ({
        url: `group/${id}`,
        method: "DELETE",
      }),
      async onQueryStarted(id, { dispatch, getState, queryFulfilled }) {
        const { channelMessage } = getState();
        try {
          await queryFulfilled;
          dispatch(removeChannel(id));
          // 删掉该channel下的所有消息&reaction
          const mids = channelMessage[id];
          if (mids) {
            dispatch(removeChannelSession(id));
            dispatch(removeMessage(mids));
            dispatch(removeReactionMessage(mids));
          }
        } catch {
          console.log("remove channel error");
        }
      },
    }),
    sendChannelMsg: builder.mutation({
      query: ({ id, content, type = "text", properties = "" }) => ({
        headers: {
          "content-type": ContentTypes[type],
          "X-Properties": properties ? btoa(JSON.stringify(properties)) : "",
        },
        url: `group/${id}/send`,
        method: "POST",
        body: type == "file" ? JSON.stringify(content) : content,
      }),
      async onQueryStarted(param1, param2) {
        await onMessageSendStarted.call(this, param1, param2, "channel");
      },
    }),
    addMembers: builder.mutation({
      query: ({ id, members }) => ({
        url: `group/${id}/members/add`,
        method: "POST",
        body: members,
      }),
    }),
    removeMembers: builder.mutation({
      query: ({ id, members }) => ({
        url: `group/${id}/members/remove`,
        method: "POST",
        body: members,
      }),
    }),
  }),
});

export const {
  useLazyGetHistoryMessagesQuery,
  useGetChannelQuery,
  useUpdateChannelMutation,
  useLazyRemoveChannelQuery,
  useGetChannelsQuery,
  useCreateChannelMutation,
  useSendChannelMsgMutation,
  useAddMembersMutation,
  useRemoveMembersMutation,
} = channelApi;
