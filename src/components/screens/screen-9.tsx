"use client";

import type { ServerResponse } from "@/types/server";
import { DeliveryPickupScreen } from "./delivery-pickup-screen";

interface Screen9Props {
  serverResponse?: ServerResponse;
  isActive?: boolean;
}

export function Screen9({ serverResponse, isActive = false }: Screen9Props) {
  return (
    <DeliveryPickupScreen
      serverResponse={serverResponse}
      isReversed={true}
      isActive={isActive}
    />
  );
}
