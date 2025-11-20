"use client";

import type { ServerResponse } from "@/types/server";
import { DeliveryPickupScreen } from "./delivery-pickup-screen";

interface Screen8Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen8({ serverResponse, isActive = false }: Screen8Props) {
  return (
    <DeliveryPickupScreen
      serverResponse={serverResponse}
      isReversed={false}
      isActive={isActive}
    />
  );
}
