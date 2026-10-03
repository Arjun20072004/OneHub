import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import {
  Bot,
  ChevronDown,
  MapPin,
  Send,
  ShoppingCart,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";

import { useAuthStore } from "../../store/authStore";

import {
  getRestaurant,
  getRestaurants,
} from "../../services/food";

import type {
  MenuItem,
  Restaurant,
  RestaurantDetail,
} from "../../services/food";

import {
  searchShoppingProducts,
} from "../../services/shopping";

import type {
  ShoppingProduct,
} from "../../services/shopping";

import { useNavigate } from "react-router-dom";

import {
  understandRequest,
} from "./assistantIntent";

import "./AssistantWidget.css";

type AssistantAction = {
  label: string;
  path: string;
};

type AssistantMessage = {
  id: number;
  from: "assistant" | "user";
  text: string;

  suggestions?: Restaurant[];

  menu?: Array<{
    restaurant: RestaurantDetail;
    item: MenuItem;
  }>;

  shoppingProducts?: ShoppingProduct[];

  action?: AssistantAction;

  intent?:
    | "food"
    | "travel"
    | "doctor"
    | "mechanic"
    | "shopping"
    | "general"
    | "unknown";
};

const starterSuggestions = [
  "I want chicken dum biryani",
  "I need a phone",
  "What can OneHub help me with?",
];

function getTravelDetails(question: string) {
  const normalized = question.toLowerCase();

  const flight =
    normalized.includes("flight") ||
    normalized.includes("fly") ||
    normalized.includes("airline");

  const hotel =
    normalized.includes("hotel") ||
    normalized.includes("stay") ||
    normalized.includes("room");

  const train =
    normalized.includes("train") ||
    normalized.includes("railway");

  const bus =
    normalized.includes("bus") ||
    normalized.includes("volvo") ||
    normalized.includes("bus ticket");

  return {
    flight,
    hotel,
    train,
    bus,
  };
}

function isShoppingQuestion(question: string): boolean {
  const normalized = question.toLowerCase().trim();

  const shoppingKeywords = [
    "phone",
    "mobile",
    "smartphone",
    "samsung",
    "iphone",
    "android",
    "laptop",
    "computer",
    "tablet",
    "watch",
    "smartwatch",
    "headphone",
    "headphones",
    "earphone",
    "earphones",
    "earbuds",
    "shirt",
    "shirts",
    "clothes",
    "clothing",
    "fashion",
    "air fryer",
    "airfryer",
    "appliance",
    "appliances",
    "backpack",
    "luggage",
    "bag",
    "shopping",
    "product",
    "products",
    "electronics",
  ];

  return shoppingKeywords.some((keyword) =>
    normalized.includes(keyword),
  );
}

function getShoppingSearchText(question: string): string {
  return question
    .toLowerCase()
    .replace(/^i want\s+/i, "")
    .replace(/^i need\s+/i, "")
    .replace(/^i am looking for\s+/i, "")
    .replace(/^i'm looking for\s+/i, "")
    .replace(/^find\s+/i, "")
    .replace(/^show\s+me\s+/i, "")
    .replace(/^get\s+me\s+/i, "")
    .replace(/^buy\s+/i, "")
    .trim();
}

export default function AssistantWidget() {
  const user = useAuthStore((state) => state.user);

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  const [messages, setMessages] =
    useState<AssistantMessage[]>([
      {
        id: 1,
        from: "assistant",
        text: `Hi ${
          user?.first_name || "there"
        }. I’m your OneHub Guide. Tell me what you need and I’ll help you find it.`,
        intent: "general",
      },
    ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, busy]);

  useEffect(() => {
    if (!user?.first_name) return;

    setMessages((current) => {
      if (current.length !== 1) {
        return current;
      }

      return [
        {
          ...current[0],
          text: `Hi ${user.first_name}. I’m your OneHub Guide. Tell me what you need and I’ll help you find it.`,
        },
      ];
    });
  }, [user?.first_name]);

  const answer = async (
    question: string,
  ): Promise<AssistantMessage> => {
    const normalized = question.toLowerCase().trim();

    const understanding = understandRequest(question);
    const intent = understanding.intent;

    /*
     * GENERAL / HELP
     */
    if (
      normalized.includes("what can") ||
      normalized.includes("what do you") ||
      normalized.includes("help me") ||
      normalized === "help"
    ) {
      return {
        id: Date.now(),
        from: "assistant",
        text:
          "I can help you with Food & Dining, travel, doctors, mechanics, shopping, bookings, orders, and other OneHub services. Just tell me what you need in normal language.",
        intent: "general",
      };
    }

    /*
     * SHOPPING
     *
     * Check shopping before the Food API.
     * This prevents requests such as
     * "I need a phone" from being sent to
     * the restaurant search.
     */
    if (
      isShoppingQuestion(question) ||
      intent === "shopping_search"
    ) {
      const searchText = getShoppingSearchText(question);

      const products =
        searchShoppingProducts(searchText);

      if (products.length === 0) {
        return {
          id: Date.now(),
          from: "assistant",
          text:
            "I couldn't find a matching product in OneHub Shopping. Try asking for a phone, smartwatch, shirt, air fryer, earbuds, or backpack.",
          intent: "shopping",
          action: {
            label: "Open Shopping",
            path: "/shopping",
          },
        };
      }

      const firstProduct = products[0];

      return {
        id: Date.now(),
        from: "assistant",
        text:
          products.length === 1
            ? `I found ${firstProduct.name} in OneHub Shopping for ${firstProduct.price}.`
            : `I found ${products.length} products that match your request. Here are the closest options.`,
        shoppingProducts: products.slice(0, 5),
        intent: "shopping",
      };
    }

    /*
     * TRAVEL
     */
    if (intent === "travel_search") {
      const travel = getTravelDetails(question);

      if (travel.flight) {
        return {
          id: Date.now(),
          from: "assistant",
          text:
            "I understand that you want to search for a flight. I’ll need the departure city, destination, travel date, and number of passengers to search accurately.",
          intent: "travel",
          action: {
            label: "Open Travel",
            path: "/travel",
          },
        };
      }

      if (travel.hotel) {
        return {
          id: Date.now(),
          from: "assistant",
          text:
            "I understand that you’re looking for accommodation. Tell me the city, check-in date, check-out date, and number of guests.",
          intent: "travel",
          action: {
            label: "Open Travel",
            path: "/travel",
          },
        };
      }

      if (travel.train) {
        return {
          id: Date.now(),
          from: "assistant",
          text:
            "I can help you search for trains. Tell me the departure city, destination, travel date, and passengers.",
          intent: "travel",
          action: {
            label: "Open Travel",
            path: "/travel",
          },
        };
      }

      if (travel.bus) {
        return {
          id: Date.now(),
          from: "assistant",
          text:
            "I can help you search for buses. Tell me the departure city, destination, travel date, and passengers.",
          intent: "travel",
          action: {
            label: "Open Travel",
            path: "/travel",
          },
        };
      }

      return {
        id: Date.now(),
        from: "assistant",
        text:
          "I can help with flights, hotels, trains, buses, and travel planning. Tell me what you want to book.",
        intent: "travel",
        action: {
          label: "Open Travel",
          path: "/travel",
        },
      };
    }

    /*
     * DOCTOR CARE
     */
    if (intent === "doctor_search") {
      if (understanding.specialty) {
        const specialty =
          understanding.specialty;

        return {
          id: Date.now(),
          from: "assistant",
          text:
            `For your request, the appropriate specialist is a ${specialty}. ` +
            `I can show you OneHub Doctor Care options for ${specialty}.`,
          intent: "doctor",
          action: {
            label: `Find ${specialty}s`,
            path: "/doctor",
          },
        };
      }

      return {
        id: Date.now(),
        from: "assistant",
        text:
          "I can help you find the right medical specialist. Tell me what health problem or type of doctor you are looking for.",
        intent: "doctor",
        action: {
          label: "Open Doctor Care",
          path: "/doctor",
        },
      };
    }

    /*
     * MECHANIC / ROADSIDE
     */
    if (intent === "mechanic_search") {
      return {
        id: Date.now(),
        from: "assistant",
        text:
          "I can help with mechanics, fuel delivery, tyre problems, battery assistance, towing, and roadside support. I’m opening On The Move.",
        intent: "mechanic",
        action: {
          label: "Open On The Move",
          path: "/mechanic",
        },
      };
    }

    /*
     * FOOD
     *
     * Existing Food API behaviour is preserved.
     */
    const restaurants =
      await getRestaurants(question);

    if (restaurants.length === 0) {
      return {
        id: Date.now(),
        from: "assistant",
        text:
          "I couldn’t find a close match. Try asking for a dish, cuisine, restaurant, or service.",
        intent: "unknown",
      };
    }

    const menuMatches: Array<{
      restaurant: RestaurantDetail;
      item: MenuItem;
    }> = [];

    const searchText = normalized
      .replace(/^i want\s+/i, "")
      .replace(/^i need\s+/i, "")
      .replace(/^find\s+/i, "")
      .replace(/^show\s+me\s+/i, "")
      .trim();

    for (const restaurant of restaurants.slice(0, 4)) {
      try {
        const detail =
          await getRestaurant(restaurant.id);

        const item = detail.categories
          .flatMap((category) => category.items)
          .find((candidate) => {
            const candidateText =
              `${candidate.name} ${
                candidate.description || ""
              }`.toLowerCase();

            return (
              candidateText.includes(searchText) ||
              searchText
                .split(/\s+/)
                .filter(Boolean)
                .some((word) =>
                  candidateText.includes(word),
                )
            );
          });

        if (item) {
          menuMatches.push({
            restaurant: detail,
            item,
          });
        }
      } catch {
        /*
         * One restaurant detail failing should not
         * prevent other restaurant results.
         */
      }
    }

    const bestRestaurant =
      restaurants[0];

    const bestDish =
      menuMatches[0]?.item;

    const dishText = bestDish
      ? ` I also found ${bestDish.name} at ${menuMatches[0].restaurant.name} for ₹${bestDish.price}.`
      : "";

    return {
      id: Date.now(),
      from: "assistant",
      text:
        `I found some good options. ${bestRestaurant.name} has a ${bestRestaurant.rating} rating and approximately ${bestRestaurant.delivery_minutes} minutes delivery.${dishText}`,
      suggestions: restaurants,
      menu: menuMatches,
      intent: "food",
    };
  };

  const send = async (
    event?: FormEvent,
    suggestedQuestion?: string,
  ) => {
    event?.preventDefault();

    const question = (
      suggestedQuestion || input
    ).trim();

    if (!question || busy) {
      return;
    }

    setInput("");

    const userMessage: AssistantMessage = {
      id: Date.now(),
      from: "user",
      text: question,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setBusy(true);

    try {
      const result =
        await answer(question);

      setMessages((current) => [
        ...current,
        {
          ...result,
          id: Date.now() + 1,
        },
      ]);
    } catch (error) {
      console.error(
        "OneHub Assistant error:",
        error,
      );

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          from: "assistant",
          text:
            "I’m having trouble reaching OneHub right now. Please try again in a moment.",
          intent: "unknown",
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="assistant-launcher"
        onClick={() => setOpen(true)}
        aria-label="Open OneHub AI"
        title="Open OneHub AI"
      >
        <Sparkles size={21} />
      </button>
    );
  }

  return (
    <aside
      className="assistant-panel"
      aria-label="OneHub AI assistant"
    >
      <header className="assistant-panel__header">
        <div className="assistant-panel__identity">
          <span className="assistant-avatar">
            <Bot size={19} />
          </span>

          <span className="assistant-panel__title">
            <strong>OneHub AI</strong>

            <small>
              <span className="online-dot" />
              Available now
            </small>
          </span>
        </div>

        <div className="assistant-panel__actions">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Minimize OneHub AI"
            title="Minimize"
          >
            <ChevronDown size={18} />
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close OneHub AI"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="assistant-messages">
        {messages.map((message) => (
          <div
            className={
              message.from === "user"
                ? "assistant-message assistant-message--user"
                : "assistant-message"
            }
            key={message.id}
          >
            <p>{message.text}</p>

            {message.action && (
              <button
                type="button"
                className="assistant-action"
                onClick={() =>
                  navigate(
                    message.action!.path,
                  )
                }
              >
                {message.action.label}
              </button>
            )}

            {message.shoppingProducts && (
              <div className="assistant-shopping-results">
                {message.shoppingProducts.map(
                  (product) => (
                    <button
                      type="button"
                      className="assistant-shopping-card"
                      key={product.id}
                      onClick={() =>
                        navigate("/shopping")
                      }
                    >
                      <span className="assistant-shopping-card__icon">
                        <ShoppingCart size={17} />
                      </span>

                      <span className="assistant-shopping-card__content">
                        <strong>
                          {product.name}
                        </strong>

                        <small>
                          {product.category}
                        </small>

                        <b>
                          {product.price}
                        </b>
                      </span>

                      <span className="assistant-shopping-card__action">
                        View
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}

            {message.menu?.map(
              ({ restaurant, item }) => (
                <button
                  type="button"
                  className="assistant-food-card"
                  key={`${restaurant.id}-${item.id}`}
                  onClick={() =>
                    navigate(
                      `/customer/food/${restaurant.id}`,
                    )
                  }
                >
                  <span>
                    <Utensils size={16} />

                    <strong>
                      {item.name}
                    </strong>

                    <small>
                      {restaurant.name} • ₹
                      {item.price} • ★{" "}
                      {restaurant.rating}
                    </small>
                  </span>

                  <span>
                    View menu
                  </span>
                </button>
              ),
            )}

            {message.suggestions && (
              <div className="assistant-suggestions">
                {message.suggestions
                  .slice(0, 3)
                  .map((restaurant) => (
                    <button
                      type="button"
                      key={restaurant.id}
                      onClick={() =>
                        navigate(
                          `/customer/food/${restaurant.id}`,
                        )
                      }
                    >
                      <strong>
                        {restaurant.name}
                      </strong>

                      <small>
                        ★ {restaurant.rating} •{" "}
                        {restaurant.delivery_minutes}{" "}
                        min
                      </small>
                    </button>
                  ))}
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="assistant-typing">
            <span />
            <span />
            <span />

            <small>
              OneHub AI is thinking...
            </small>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="assistant-prompt-row">
          {starterSuggestions.map(
            (suggestion) => (
              <button
                type="button"
                key={suggestion}
                onClick={() => {
                  void send(
                    undefined,
                    suggestion,
                  );
                }}
              >
                {suggestion}
              </button>
            ),
          )}
        </div>
      )}

      <form
        className="assistant-input"
        onSubmit={send}
      >
        <MapPin size={16} />

        <input
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          placeholder="Ask OneHub anything..."
          disabled={busy}
          autoComplete="off"
        />

        <button
          type="submit"
          aria-label="Send message"
          disabled={!input.trim() || busy}
        >
          <Send size={17} />
        </button>
      </form>
    </aside>
  );
}