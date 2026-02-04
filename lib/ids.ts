import { nanoid } from "nanoid";

export function giftToken() {
  return nanoid(16);
}

export function giftId() {
  return nanoid(10);
}

export function mediaId() {
  return nanoid(12);
}

export function deliveryId() {
  return nanoid(12);
}
