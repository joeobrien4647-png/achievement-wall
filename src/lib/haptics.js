/**
 * Haptic feedback utility — triggers vibration on supported mobile devices.
 * Silently no-ops on unsupported devices (desktop, older browsers).
 */

/** Light tap — button presses, toggles */
export function hapticLight() {
  navigator.vibrate?.(10);
}

/** Medium tap — drag drop, promoting events */
export function hapticMedium() {
  navigator.vibrate?.(25);
}

/** Success pattern — badge unlock, streak milestone */
export function hapticSuccess() {
  navigator.vibrate?.([15, 50, 15]);
}

/** Heavy — destructive actions (delete confirm) */
export function hapticHeavy() {
  navigator.vibrate?.(50);
}
