"use client";

import type { ServerResponse } from "@/types/server";
import { DeliveryPickupScreen } from "./delivery-pickup-screen";

interface Screen8Props {
  serverResponse?: ServerResponse;
}

export function Screen8({ serverResponse }: Screen8Props) {
  return <DeliveryPickupScreen serverResponse={serverResponse} isReversed={false} />;
}
