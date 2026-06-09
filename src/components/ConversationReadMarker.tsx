"use client";

import { useEffect } from "react";

interface Props {
  conversationId: string;
}

export default function ConversationReadMarker({ conversationId }: Props) {
  useEffect(() => {
    void fetch(`/api/conversations/${conversationId}/read`, { method: "PATCH" });
  }, [conversationId]);

  return null;
}
