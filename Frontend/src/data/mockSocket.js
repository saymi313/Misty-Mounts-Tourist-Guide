// ─────────────────────────────────────────────────────────────────────────────
// Misty Mounts — Mock Socket
//
// Drop-in replacement for the Socket.io client while the backend is off.
// Implements the on/off/emit/connect/disconnect surface the app uses, and
// simulates a local guide who greets the user and replies to their messages.
// ─────────────────────────────────────────────────────────────────────────────

const GUIDE = "Karim (Hunza Guide)";

const cannedReplies = [
  "Salaam! For Attabad Lake, aim for a sunrise boat — the water is calmest and bluest before 8 AM.",
  "Great choice. I'd budget two nights in Karimabad so you can do both Baltit Fort and Eagle's Nest without rushing.",
  "The jeep to the trailhead takes about 45 minutes. I can arrange a driver who knows the sunrise timings.",
  "Roads are clear this week, but pack a warm layer — evenings drop close to freezing even in summer.",
  "Happy to build you a full 6-day Hunza itinerary. Want me to include Passu Cones and the Hussaini suspension bridge?",
];

class MockSocket {
  constructor() {
    this.connected = false;
    this._listeners = {};
    this._replyIndex = 0;
    this._timers = [];
  }

  on(event, handler) {
    (this._listeners[event] ||= []).push(handler);
    return this;
  }

  off(event, handler) {
    if (!this._listeners[event]) return this;
    if (!handler) this._listeners[event] = [];
    else this._listeners[event] = this._listeners[event].filter((h) => h !== handler);
    return this;
  }

  _fire(event, payload) {
    (this._listeners[event] || []).forEach((h) => {
      try {
        h(payload);
      } catch (e) {
        /* swallow listener errors in the mock */
      }
    });
  }

  _later(fn, ms) {
    const id = setTimeout(fn, ms);
    this._timers.push(id);
  }

  connect() {
    if (this.connected) return this;
    this.connected = true;
    this._later(() => this._fire("connect"), 120);
    return this;
  }

  disconnect() {
    this.connected = false;
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this._fire("disconnect", "client disconnect");
    return this;
  }

  emit(event, data) {
    switch (event) {
      case "join-chat":
        this._later(
          () =>
            this._fire("system-message", {
              message: `You're connected with ${GUIDE}. Ask anything about routes, weather, or bookings.`,
              type: "info",
            }),
          400
        );
        this._later(
          () =>
            this._fire("agent-message", {
              id: `g-${Date.now()}`,
              text: "Hello! I'm Karim, your local guide in Hunza. Where are you thinking of heading?",
              guideUsername: GUIDE,
              timestamp: new Date().toISOString(),
              broadcastToAll: false,
            }),
          1400
        );
        break;

      case "user-message":
        // Acknowledge, show the guide "typing", then reply.
        this._fire("message-sent", { ...data, delivered: true });
        this._later(
          () => this._fire("user-typing", { isTyping: true, userId: "guide", username: GUIDE }),
          700
        );
        this._later(() => {
          this._fire("user-typing", { isTyping: false, userId: "guide", username: GUIDE });
          const text = cannedReplies[this._replyIndex % cannedReplies.length];
          this._replyIndex += 1;
          this._fire("agent-message", {
            id: `g-${Date.now()}`,
            text,
            guideUsername: GUIDE,
            timestamp: new Date().toISOString(),
            broadcastToAll: false,
          });
          this._fire("new-message-notification", { isFromGuide: true, message: text });
          // Mark the user's message as read.
          this._later(() => this._fire("message-read", { by: "guide" }), 500);
        }, 2200);
        break;

      case "typing":
        // No-op in the mock (the guide doesn't react to the user's typing state).
        break;

      default:
        break;
    }
    return this;
  }
}

export const socket = new MockSocket();
export default socket;
