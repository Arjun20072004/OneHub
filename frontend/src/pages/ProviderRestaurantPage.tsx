import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Plus,
  Power,
  Trash2,
} from "lucide-react";

import { api } from "../services/api";

interface MenuItemVariant {
  id: number;
  name: string;
  price_delta: string;
  is_available: boolean;
}

interface MenuItemAddon {
  id: number;
  name: string;
  price: string;
  is_available: boolean;
}

interface MenuItem {
  id: number;
  restaurant_id: number;
  category: number;
  category_name: string;
  name: string;
  description: string;
  price: string;
  preparation_minutes: number;
  is_vegetarian: boolean;
  is_available: boolean;
  variants: MenuItemVariant[];
  addons: MenuItemAddon[];
}

interface MenuCategory {
  id: number;
  restaurant: number;
  name: string;
  sort_order: number;
  items: MenuItem[];
}

interface Restaurant {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  city: string;
  latitude: string | null;
  longitude: string | null;
  rating: string;
  delivery_minutes: number;
  price_for_two: string;
  is_active: boolean;
  is_open: boolean;
  vegetarian_available: boolean;
  categories: MenuCategory[];
  created_at: string;
  updated_at: string;
}

interface RestaurantForm {
  name: string;
  description: string;
  cuisine: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  delivery_minutes: string;
  price_for_two: string;
  is_active: boolean;
  is_open: boolean;
  vegetarian_available: boolean;
}

interface CategoryForm {
  name: string;
  sort_order: string;
}

interface MenuItemForm {
  category: string;
  name: string;
  description: string;
  price: string;
  preparation_minutes: string;
  is_vegetarian: boolean;
  is_available: boolean;
}

interface VariantForm {
  name: string;
  price_delta: string;
  is_available: boolean;
}

interface AddonForm {
  name: string;
  price: string;
  is_available: boolean;
}

const emptyRestaurantForm: RestaurantForm = {
  name: "",
  description: "",
  cuisine: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  delivery_minutes: "40",
  price_for_two: "0",
  is_active: true,
  is_open: true,
  vegetarian_available: false,
};

const emptyCategoryForm: CategoryForm = {
  name: "",
  sort_order: "0",
};

const emptyMenuItemForm: MenuItemForm = {
  category: "",
  name: "",
  description: "",
  price: "",
  preparation_minutes: "25",
  is_vegetarian: false,
  is_available: true,
};

const emptyVariantForm: VariantForm = {
  name: "",
  price_delta: "0",
  is_available: true,
};

const emptyAddonForm: AddonForm = {
  name: "",
  price: "0",
  is_available: true,
};

export default function ProviderRestaurantPage() {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [restaurantForm, setRestaurantForm] =
    useState<RestaurantForm>(emptyRestaurantForm);

  const [showRestaurantEditor, setShowRestaurantEditor] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showMenuItemForm, setShowMenuItemForm] = useState(false);

  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm);

  const [menuItemForm, setMenuItemForm] =
    useState<MenuItemForm>(emptyMenuItemForm);

  const [editingCategoryId, setEditingCategoryId] =
    useState<number | null>(null);

  const [editingMenuItemId, setEditingMenuItemId] =
    useState<number | null>(null);

  const [expandedCategories, setExpandedCategories] =
    useState<Record<number, boolean>>({});

  const [showVariantForm, setShowVariantForm] =
    useState<number | null>(null);

  const [showAddonForm, setShowAddonForm] =
    useState<number | null>(null);

  const [variantForm, setVariantForm] =
    useState<VariantForm>(emptyVariantForm);

  const [addonForm, setAddonForm] =
    useState<AddonForm>(emptyAddonForm);

  const [editingVariantId, setEditingVariantId] =
    useState<number | null>(null);

  const [editingAddonId, setEditingAddonId] =
    useState<number | null>(null);

  async function loadRestaurant() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get<Restaurant>(
        "/food/provider/restaurant/",
      );

      const data = response.data;

      setRestaurant(data);

      setRestaurantForm({
        name: data.name,
        description: data.description,
        cuisine: data.cuisine,
        address: data.address,
        city: data.city,
        latitude: data.latitude ?? "",
        longitude: data.longitude ?? "",
        delivery_minutes: String(data.delivery_minutes),
        price_for_two: String(data.price_for_two),
        is_active: data.is_active,
        is_open: data.is_open,
        vegetarian_available: data.vegetarian_available,
      });
    } catch {
      setRestaurant(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRestaurant();
  }, []);

  function clearMessages() {
    setError("");
    setSuccess("");
  }

  async function saveRestaurant(event: FormEvent) {
    event.preventDefault();

    clearMessages();
    setSaving(true);

    try {
      const payload = {
        ...restaurantForm,
        latitude: restaurantForm.latitude || null,
        longitude: restaurantForm.longitude || null,
        delivery_minutes: Number(restaurantForm.delivery_minutes),
        price_for_two: restaurantForm.price_for_two,
      };

      const response = restaurant
        ? await api.patch<Restaurant>(
            "/food/provider/restaurant/",
            payload,
          )
        : await api.post<Restaurant>(
            "/food/provider/restaurant/",
            payload,
          );

      setRestaurant(response.data);

      setRestaurantForm({
        name: response.data.name,
        description: response.data.description,
        cuisine: response.data.cuisine,
        address: response.data.address,
        city: response.data.city,
        latitude: response.data.latitude ?? "",
        longitude: response.data.longitude ?? "",
        delivery_minutes: String(response.data.delivery_minutes),
        price_for_two: String(response.data.price_for_two),
        is_active: response.data.is_active,
        is_open: response.data.is_open,
        vegetarian_available: response.data.vegetarian_available,
      });

      setShowRestaurantEditor(false);
      setSuccess(
        restaurant
          ? "Restaurant updated successfully."
          : "Restaurant created successfully.",
      );

      await loadRestaurant();
    } catch {
      setError("Unable to save restaurant details.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleRestaurantOpen() {
    if (!restaurant) return;

    clearMessages();

    try {
      const response = await api.patch<Restaurant>(
        "/food/provider/restaurant/",
        {
          is_open: !restaurant.is_open,
        },
      );

      setRestaurant(response.data);

      setRestaurantForm((current) => ({
        ...current,
        is_open: response.data.is_open,
      }));

      setSuccess(
        response.data.is_open
          ? "Restaurant is now open."
          : "Restaurant is now closed.",
      );
    } catch {
      setError("Unable to update restaurant status.");
    }
  }

  async function saveCategory(event: FormEvent) {
    event.preventDefault();

    if (!restaurant) return;

    clearMessages();
    setSaving(true);

    try {
      const payload = {
        name: categoryForm.name,
        sort_order: Number(categoryForm.sort_order),
      };

      if (editingCategoryId) {
        await api.patch(
          `/food/provider/categories/${editingCategoryId}/`,
          payload,
        );
      } else {
        await api.post(
          "/food/provider/categories/",
          payload,
        );
      }

      const wasEditing = editingCategoryId !== null;

      setCategoryForm(emptyCategoryForm);
      setEditingCategoryId(null);
      setShowCategoryForm(false);

      setSuccess(
        wasEditing
          ? "Category updated successfully."
          : "Category created successfully.",
      );

      await loadRestaurant();
    } catch {
      setError("Unable to save category.");
    } finally {
      setSaving(false);
    }
  }

  function startCategoryEdit(category: MenuCategory) {
    clearMessages();

    setCategoryForm({
      name: category.name,
      sort_order: String(category.sort_order),
    });

    setEditingCategoryId(category.id);
    setShowCategoryForm(true);
  }

  async function deleteCategory(categoryId: number) {
    const confirmed = window.confirm(
      "Delete this category? All menu items inside it will also be deleted.",
    );

    if (!confirmed) return;

    clearMessages();

    try {
      await api.delete(
        `/food/provider/categories/${categoryId}/`,
      );

      setSuccess("Category deleted successfully.");

      await loadRestaurant();
    } catch {
      setError("Unable to delete category.");
    }
  }

  async function saveMenuItem(event: FormEvent) {
    event.preventDefault();

    if (!restaurant) return;

    clearMessages();
    setSaving(true);

    try {
      const payload = {
        category: Number(menuItemForm.category),
        name: menuItemForm.name,
        description: menuItemForm.description,
        price: menuItemForm.price,
        preparation_minutes: Number(
          menuItemForm.preparation_minutes,
        ),
        is_vegetarian: menuItemForm.is_vegetarian,
        is_available: menuItemForm.is_available,
      };

      if (editingMenuItemId) {
        await api.patch(
          `/food/provider/menu-items/${editingMenuItemId}/`,
          payload,
        );
      } else {
        await api.post(
          "/food/provider/menu-items/",
          payload,
        );
      }

      const wasEditing = editingMenuItemId !== null;

      setMenuItemForm(emptyMenuItemForm);
      setEditingMenuItemId(null);
      setShowMenuItemForm(false);

      setSuccess(
        wasEditing
          ? "Menu item updated successfully."
          : "Menu item created successfully.",
      );

      await loadRestaurant();
    } catch {
      setError("Unable to save menu item.");
    } finally {
      setSaving(false);
    }
  }

  function startMenuItemEdit(item: MenuItem) {
    clearMessages();

    setMenuItemForm({
      category: String(item.category),
      name: item.name,
      description: item.description,
      price: item.price,
      preparation_minutes: String(item.preparation_minutes),
      is_vegetarian: item.is_vegetarian,
      is_available: item.is_available,
    });

    setEditingMenuItemId(item.id);
    setShowMenuItemForm(true);
  }

  async function deleteMenuItem(itemId: number) {
    const confirmed = window.confirm(
      "Delete this menu item?",
    );

    if (!confirmed) return;

    clearMessages();

    try {
      await api.delete(
        `/food/provider/menu-items/${itemId}/`,
      );

      if (showVariantForm === itemId) {
        setShowVariantForm(null);
        setEditingVariantId(null);
        setVariantForm(emptyVariantForm);
      }

      if (showAddonForm === itemId) {
        setShowAddonForm(null);
        setEditingAddonId(null);
        setAddonForm(emptyAddonForm);
      }

      setSuccess("Menu item deleted successfully.");

      await loadRestaurant();
    } catch {
      setError("Unable to delete menu item.");
    }
  }

  async function toggleMenuItem(item: MenuItem) {
    clearMessages();

    try {
      await api.patch(
        `/food/provider/menu-items/${item.id}/`,
        {
          is_available: !item.is_available,
        },
      );

      setSuccess(
        item.is_available
          ? `${item.name} is now unavailable.`
          : `${item.name} is now available.`,
      );

      await loadRestaurant();
    } catch {
      setError("Unable to update menu item availability.");
    }
  }

  async function saveVariant(
    event: FormEvent,
    menuItemId: number,
  ) {
    event.preventDefault();

    clearMessages();
    setSaving(true);

    try {
      const payload = {
        name: variantForm.name,
        price_delta: variantForm.price_delta,
        is_available: variantForm.is_available,
      };

      const wasEditing = editingVariantId !== null;

      if (editingVariantId) {
        await api.patch(
          `/food/provider/variants/${editingVariantId}/`,
          payload,
        );
      } else {
        await api.post(
          `/food/provider/menu-items/${menuItemId}/variants/`,
          payload,
        );
      }

      setVariantForm(emptyVariantForm);
      setEditingVariantId(null);
      setShowVariantForm(null);

      setSuccess(
        wasEditing
          ? "Variant updated successfully."
          : "Variant created successfully.",
      );

      await loadRestaurant();
    } catch {
      setError("Unable to save variant.");
    } finally {
      setSaving(false);
    }
  }

  function startVariantEdit(
    variant: MenuItemVariant,
    menuItemId: number,
  ) {
    clearMessages();

    setVariantForm({
      name: variant.name,
      price_delta: variant.price_delta,
      is_available: variant.is_available,
    });

    setEditingVariantId(variant.id);
    setShowVariantForm(menuItemId);
    setShowAddonForm(null);
  }

  async function deleteVariant(variantId: number) {
    const confirmed = window.confirm(
      "Delete this variant?",
    );

    if (!confirmed) return;

    clearMessages();

    try {
      await api.delete(
        `/food/provider/variants/${variantId}/`,
      );

      setSuccess("Variant deleted successfully.");

      await loadRestaurant();
    } catch {
      setError("Unable to delete variant.");
    }
  }

  async function toggleVariant(variant: MenuItemVariant) {
    clearMessages();

    try {
      await api.patch(
        `/food/provider/variants/${variant.id}/`,
        {
          is_available: !variant.is_available,
        },
      );

      setSuccess(
        variant.is_available
          ? `${variant.name} is now unavailable.`
          : `${variant.name} is now available.`,
      );

      await loadRestaurant();
    } catch {
      setError("Unable to update variant availability.");
    }
  }

  async function saveAddon(
    event: FormEvent,
    menuItemId: number,
  ) {
    event.preventDefault();

    clearMessages();
    setSaving(true);

    try {
      const payload = {
        name: addonForm.name,
        price: addonForm.price,
        is_available: addonForm.is_available,
      };

      const wasEditing = editingAddonId !== null;

      if (editingAddonId) {
        await api.patch(
          `/food/provider/addons/${editingAddonId}/`,
          payload,
        );
      } else {
        await api.post(
          `/food/provider/menu-items/${menuItemId}/addons/`,
          payload,
        );
      }

      setAddonForm(emptyAddonForm);
      setEditingAddonId(null);
      setShowAddonForm(null);

      setSuccess(
        wasEditing
          ? "Add-on updated successfully."
          : "Add-on created successfully.",
      );

      await loadRestaurant();
    } catch {
      setError("Unable to save add-on.");
    } finally {
      setSaving(false);
    }
  }

  function startAddonEdit(
    addon: MenuItemAddon,
    menuItemId: number,
  ) {
    clearMessages();

    setAddonForm({
      name: addon.name,
      price: addon.price,
      is_available: addon.is_available,
    });

    setEditingAddonId(addon.id);
    setShowAddonForm(menuItemId);
    setShowVariantForm(null);
  }

  async function deleteAddon(addonId: number) {
    const confirmed = window.confirm(
      "Delete this add-on?",
    );

    if (!confirmed) return;

    clearMessages();

    try {
      await api.delete(
        `/food/provider/addons/${addonId}/`,
      );

      setSuccess("Add-on deleted successfully.");

      await loadRestaurant();
    } catch {
      setError("Unable to delete add-on.");
    }
  }

  async function toggleAddon(addon: MenuItemAddon) {
    clearMessages();

    try {
      await api.patch(
        `/food/provider/addons/${addon.id}/`,
        {
          is_available: !addon.is_available,
        },
      );

      setSuccess(
        addon.is_available
          ? `${addon.name} is now unavailable.`
          : `${addon.name} is now available.`,
      );

      await loadRestaurant();
    } catch {
      setError("Unable to update add-on availability.");
    }
  }

  function toggleCategory(categoryId: number) {
    setExpandedCategories((current) => ({
      ...current,
      [categoryId]: !current[categoryId],
    }));
  }

  function cancelCategoryEdit() {
    setCategoryForm(emptyCategoryForm);
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  }

  function cancelMenuItemEdit() {
    setMenuItemForm(emptyMenuItemForm);
    setEditingMenuItemId(null);
    setShowMenuItemForm(false);
  }

  function cancelVariantEdit() {
    setVariantForm(emptyVariantForm);
    setEditingVariantId(null);
    setShowVariantForm(null);
  }

  function cancelAddonEdit() {
    setAddonForm(emptyAddonForm);
    setEditingAddonId(null);
    setShowAddonForm(null);
  }

  if (loading) {
    return (
      <main className="service-page">
        <section className="service-hero service-hero--travel">
          <div>
            <span className="eyebrow">
              Provider workspace
            </span>

            <h1>Restaurant</h1>

            <p>Loading your restaurant...</p>
          </div>

          <Power size={46} />
        </section>
      </main>
    );
  }

  return (
    <main className="service-page">
      <section className="service-hero service-hero--travel">
        <div>
          <span className="eyebrow">
            Provider workspace
          </span>

          <h1>
            {restaurant
              ? restaurant.name
              : "Set up your restaurant"}
          </h1>

          <p>
            Manage your restaurant, categories, menu items,
            variants and add-ons from one place.
          </p>
        </div>

        <Power size={46} />
      </section>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      {success && (
        <div className="travel-panel">
          {success}
        </div>
      )}

      {!restaurant ? (
        <section className="travel-panel">
          <span className="eyebrow">
            Restaurant setup
          </span>

          <h2>Create your restaurant</h2>

          <p>
            Your provider account does not have a restaurant yet.
          </p>

          <button
            className="primary-button"
            onClick={() => {
              clearMessages();
              setShowRestaurantEditor(true);
            }}
          >
            <Plus size={17} />
            Create restaurant
          </button>

          {showRestaurantEditor && (
            <form
              onSubmit={saveRestaurant}
              style={{
                display: "grid",
                gap: "14px",
                marginTop: "20px",
              }}
            >
              <input
                value={restaurantForm.name}
                onChange={(event) =>
                  setRestaurantForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Restaurant name"
                required
              />

              <input
                value={restaurantForm.cuisine}
                onChange={(event) =>
                  setRestaurantForm((current) => ({
                    ...current,
                    cuisine: event.target.value,
                  }))
                }
                placeholder="Cuisine"
                required
              />

              <textarea
                value={restaurantForm.description}
                onChange={(event) =>
                  setRestaurantForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Description"
                rows={4}
              />

              <textarea
                value={restaurantForm.address}
                onChange={(event) =>
                  setRestaurantForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                placeholder="Restaurant address"
                rows={3}
                required
              />

              <input
                value={restaurantForm.city}
                onChange={(event) =>
                  setRestaurantForm((current) => ({
                    ...current,
                    city: event.target.value,
                  }))
                }
                placeholder="City"
                required
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <input
                  type="number"
                  step="any"
                  value={restaurantForm.latitude}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      latitude: event.target.value,
                    }))
                  }
                  placeholder="Latitude"
                />

                <input
                  type="number"
                  step="any"
                  value={restaurantForm.longitude}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      longitude: event.target.value,
                    }))
                  }
                  placeholder="Longitude"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                }}
              >
                <input
                  type="number"
                  min="0"
                  value={restaurantForm.delivery_minutes}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      delivery_minutes: event.target.value,
                    }))
                  }
                  placeholder="Delivery minutes"
                  required
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={restaurantForm.price_for_two}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      price_for_two: event.target.value,
                    }))
                  }
                  placeholder="Price for two"
                  required
                />
              </div>

              <label>
                <input
                  type="checkbox"
                  checked={restaurantForm.is_active}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      is_active: event.target.checked,
                    }))
                  }
                />{" "}
                Restaurant active
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={restaurantForm.vegetarian_available}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      vegetarian_available:
                        event.target.checked,
                    }))
                  }
                />{" "}
                Vegetarian options available
              </label>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <button
                  className="primary-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save restaurant"}
                </button>

                <button
                  className="secondary-button"
                  type="button"
                  onClick={() =>
                    setShowRestaurantEditor(false)
                  }
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>
      ) : (
        <>
          <section className="travel-panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span className="eyebrow">
                  Restaurant
                </span>

                <h2>{restaurant.name}</h2>

                <p>
                  {restaurant.cuisine}
                  {" • "}
                  {restaurant.city}
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  className="secondary-button"
                  onClick={() => {
                    clearMessages();
                    setShowRestaurantEditor(
                      (value) => !value,
                    );
                  }}
                >
                  <Edit3 size={16} />
                  Edit restaurant
                </button>

                <button
                  className={
                    restaurant.is_open
                      ? "secondary-button"
                      : "primary-button"
                  }
                  onClick={() =>
                    void toggleRestaurantOpen()
                  }
                >
                  <Power size={16} />

                  {restaurant.is_open
                    ? "Close restaurant"
                    : "Open restaurant"}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(150px, 1fr))",
                gap: "14px",
                marginTop: "20px",
              }}
            >
              <div>
                <span className="eyebrow">
                  Status
                </span>

                <strong>
                  {restaurant.is_open
                    ? "Open"
                    : "Closed"}
                </strong>
              </div>

              <div>
                <span className="eyebrow">
                  Delivery
                </span>

                <strong>
                  {restaurant.delivery_minutes} min
                </strong>
              </div>

              <div>
                <span className="eyebrow">
                  Price for two
                </span>

                <strong>
                  ₹{restaurant.price_for_two}
                </strong>
              </div>

              <div>
                <span className="eyebrow">
                  Rating
                </span>

                <strong>
                  {restaurant.rating}
                </strong>
              </div>
            </div>
          </section>

          {showRestaurantEditor && (
            <section className="travel-panel">
              <div className="eyebrow">
                Restaurant details
              </div>

              <form
                onSubmit={saveRestaurant}
                style={{
                  display: "grid",
                  gap: "14px",
                }}
              >
                <input
                  value={restaurantForm.name}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Restaurant name"
                  required
                />

                <input
                  value={restaurantForm.cuisine}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      cuisine: event.target.value,
                    }))
                  }
                  placeholder="Cuisine"
                  required
                />

                <textarea
                  value={restaurantForm.description}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  placeholder="Description"
                  rows={4}
                />

                <textarea
                  value={restaurantForm.address}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      address:
                        event.target.value,
                    }))
                  }
                  placeholder="Restaurant address"
                  rows={3}
                  required
                />

                <input
                  value={restaurantForm.city}
                  onChange={(event) =>
                    setRestaurantForm((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                  placeholder="City"
                  required
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <input
                    type="number"
                    step="any"
                    value={restaurantForm.latitude}
                    onChange={(event) =>
                      setRestaurantForm((current) => ({
                        ...current,
                        latitude:
                          event.target.value,
                      }))
                    }
                    placeholder="Latitude"
                  />

                  <input
                    type="number"
                    step="any"
                    value={restaurantForm.longitude}
                    onChange={(event) =>
                      setRestaurantForm((current) => ({
                        ...current,
                        longitude:
                          event.target.value,
                      }))
                    }
                    placeholder="Longitude"
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "14px",
                  }}
                >
                  <input
                    type="number"
                    min="0"
                    value={
                      restaurantForm.delivery_minutes
                    }
                    onChange={(event) =>
                      setRestaurantForm((current) => ({
                        ...current,
                        delivery_minutes:
                          event.target.value,
                      }))
                    }
                    placeholder="Delivery minutes"
                    required
                  />

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      restaurantForm.price_for_two
                    }
                    onChange={(event) =>
                      setRestaurantForm((current) => ({
                        ...current,
                        price_for_two:
                          event.target.value,
                      }))
                    }
                    placeholder="Price for two"
                    required
                  />
                </div>

                <label>
                  <input
                    type="checkbox"
                    checked={
                      restaurantForm.is_active
                    }
                    onChange={(event) =>
                      setRestaurantForm((current) => ({
                        ...current,
                        is_active:
                          event.target.checked,
                      }))
                    }
                  />{" "}
                  Restaurant active
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={
                      restaurantForm.vegetarian_available
                    }
                    onChange={(event) =>
                      setRestaurantForm((current) => ({
                        ...current,
                        vegetarian_available:
                          event.target.checked,
                      }))
                    }
                  />{" "}
                  Vegetarian options available
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : "Save restaurant"}
                  </button>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={() =>
                      setShowRestaurantEditor(false)
                    }
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </section>
          )}

          <section className="travel-panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span className="eyebrow">
                  Menu
                </span>

                <h2>Categories</h2>
              </div>

              <button
                className="primary-button"
                onClick={() => {
                  clearMessages();
                  setCategoryForm(emptyCategoryForm);
                  setEditingCategoryId(null);
                  setShowCategoryForm(
                    (value) => !value,
                  );
                }}
              >
                <Plus size={16} />
                Add category
              </button>
            </div>

            {showCategoryForm && (
              <form
                onSubmit={saveCategory}
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "18px",
                }}
              >
                <input
                  value={categoryForm.name}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Category name"
                  required
                />

                <input
                  type="number"
                  min="0"
                  value={categoryForm.sort_order}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      sort_order:
                        event.target.value,
                    }))
                  }
                  placeholder="Sort order"
                />

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingCategoryId
                        ? "Update category"
                        : "Create category"}
                  </button>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={cancelCategoryEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {restaurant.categories.length === 0 ? (
              <div style={{ marginTop: "20px" }}>
                No categories yet.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                {restaurant.categories.map(
                  (category) => {
                    const expanded =
                      expandedCategories[
                        category.id
                      ] ?? true;

                    return (
                      <div
                        key={category.id}
                        style={{
                          border:
                            "1px solid rgba(0,0,0,0.08)",
                          borderRadius: "12px",
                          padding: "14px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent:
                              "space-between",
                            gap: "10px",
                          }}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleCategory(
                                category.id,
                              )
                            }
                            style={{
                              background: "none",
                              border: 0,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "16px",
                              fontWeight: 600,
                            }}
                          >
                            {expanded ? (
                              <ChevronUp size={18} />
                            ) : (
                              <ChevronDown size={18} />
                            )}

                            {category.name}

                            <span>
                              ({category.items.length})
                            </span>
                          </button>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                            }}
                          >
                            <button
                              className="secondary-button"
                              type="button"
                              onClick={() =>
                                startCategoryEdit(
                                  category,
                                )
                              }
                            >
                              <Edit3 size={15} />
                            </button>

                            <button
                              className="secondary-button"
                              type="button"
                              onClick={() =>
                                void deleteCategory(
                                  category.id,
                                )
                              }
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {expanded && (
                          <div
                            style={{
                              marginTop: "12px",
                              display: "grid",
                              gap: "10px",
                            }}
                          >
                            {category.items.length ===
                            0 ? (
                              <p>
                                No menu items in this
                                category.
                              </p>
                            ) : (
                              category.items.map(
                                (item) => (
                                  <div
                                    key={item.id}
                                    style={{
                                      padding: "12px",
                                      border:
                                        "1px solid rgba(0,0,0,0.06)",
                                      borderRadius:
                                        "10px",
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent:
                                          "space-between",
                                        gap: "15px",
                                        alignItems:
                                          "flex-start",
                                      }}
                                    >
                                      <div>
                                        <strong>
                                          {item.name}
                                        </strong>

                                        <p>
                                          ₹{item.price}{" "}
                                          •{" "}
                                          {
                                            item.preparation_minutes
                                          }{" "}
                                          min
                                        </p>

                                        {item.description && (
                                          <p>
                                            {
                                              item.description
                                            }
                                          </p>
                                        )}

                                        <small>
                                          {item.is_available
                                            ? "Available"
                                            : "Unavailable"}

                                          {item.is_vegetarian &&
                                            " • Vegetarian"}
                                        </small>
                                      </div>

                                      <div
                                        style={{
                                          display: "flex",
                                          gap: "8px",
                                          flexWrap:
                                            "wrap",
                                          justifyContent:
                                            "flex-end",
                                        }}
                                      >
                                        <button
                                          className="secondary-button"
                                          type="button"
                                          onClick={() =>
                                            void toggleMenuItem(
                                              item,
                                            )
                                          }
                                        >
                                          {item.is_available
                                            ? "Disable"
                                            : "Enable"}
                                        </button>

                                        <button
                                          className="secondary-button"
                                          type="button"
                                          onClick={() =>
                                            startMenuItemEdit(
                                              item,
                                            )
                                          }
                                        >
                                          <Edit3 size={15} />
                                        </button>

                                        <button
                                          className="secondary-button"
                                          type="button"
                                          onClick={() =>
                                            void deleteMenuItem(
                                              item.id,
                                            )
                                          }
                                        >
                                          <Trash2
                                            size={15}
                                          />
                                        </button>
                                      </div>
                                    </div>

                                    <div
                                      style={{
                                        marginTop: "14px",
                                        paddingTop: "14px",
                                        borderTop:
                                          "1px solid rgba(0,0,0,0.06)",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent:
                                            "space-between",
                                          alignItems:
                                            "center",
                                          gap: "10px",
                                          flexWrap:
                                            "wrap",
                                        }}
                                      >
                                        <strong>
                                          Variants
                                        </strong>

                                        <button
                                          className="secondary-button"
                                          type="button"
                                          onClick={() => {
                                            clearMessages();
                                            setVariantForm(
                                              emptyVariantForm,
                                            );
                                            setEditingVariantId(
                                              null,
                                            );
                                            setShowAddonForm(
                                              null,
                                            );
                                            setShowVariantForm(
                                              showVariantForm ===
                                                item.id
                                                ? null
                                                : item.id,
                                            );
                                          }}
                                        >
                                          <Plus size={14} />
                                          Add variant
                                        </button>
                                      </div>

                                      {item.variants.length ===
                                      0 ? (
                                        <p>
                                          No variants added.
                                        </p>
                                      ) : (
                                        <div
                                          style={{
                                            display: "grid",
                                            gap: "6px",
                                            marginTop: "8px",
                                          }}
                                        >
                                          {item.variants.map(
                                            (variant) => (
                                              <div
                                                key={
                                                  variant.id
                                                }
                                                style={{
                                                  display:
                                                    "flex",
                                                  justifyContent:
                                                    "space-between",
                                                  alignItems:
                                                    "center",
                                                  gap: "10px",
                                                  flexWrap:
                                                    "wrap",
                                                }}
                                              >
                                                <span>
                                                  <strong>
                                                    {
                                                      variant.name
                                                    }
                                                  </strong>{" "}
                                                  <small>
                                                    {Number(
                                                      variant.price_delta,
                                                    ) >=
                                                    0
                                                      ? "+"
                                                      : ""}
                                                    ₹
                                                    {
                                                      variant.price_delta
                                                    }
                                                  </small>{" "}
                                                  <small>
                                                    •{" "}
                                                    {variant.is_available
                                                      ? "Available"
                                                      : "Unavailable"}
                                                  </small>
                                                </span>

                                                <div
                                                  style={{
                                                    display:
                                                      "flex",
                                                    gap: "6px",
                                                  }}
                                                >
                                                  <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() =>
                                                      void toggleVariant(
                                                        variant,
                                                      )
                                                    }
                                                  >
                                                    {variant.is_available
                                                      ? "Disable"
                                                      : "Enable"}
                                                  </button>

                                                  <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() =>
                                                      startVariantEdit(
                                                        variant,
                                                        item.id,
                                                      )
                                                    }
                                                  >
                                                    <Edit3
                                                      size={
                                                        14
                                                      }
                                                    />
                                                  </button>

                                                  <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() =>
                                                      void deleteVariant(
                                                        variant.id,
                                                      )
                                                    }
                                                  >
                                                    <Trash2
                                                      size={
                                                        14
                                                      }
                                                    />
                                                  </button>
                                                </div>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      )}

                                      {showVariantForm ===
                                        item.id && (
                                        <form
                                          onSubmit={(
                                            event,
                                          ) =>
                                            void saveVariant(
                                              event,
                                              item.id,
                                            )
                                          }
                                          style={{
                                            display:
                                              "grid",
                                            gap: "8px",
                                            marginTop:
                                              "10px",
                                          }}
                                        >
                                          <input
                                            value={
                                              variantForm.name
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              setVariantForm(
                                                (
                                                  current,
                                                ) => ({
                                                  ...current,
                                                  name: event
                                                    .target
                                                    .value,
                                                }),
                                              )
                                            }
                                            placeholder="Variant name e.g. Large"
                                            required
                                          />

                                          <input
                                            type="number"
                                            step="0.01"
                                            value={
                                              variantForm.price_delta
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              setVariantForm(
                                                (
                                                  current,
                                                ) => ({
                                                  ...current,
                                                  price_delta:
                                                    event
                                                      .target
                                                      .value,
                                                }),
                                              )
                                            }
                                            placeholder="Price difference"
                                            required
                                          />

                                          <label>
                                            <input
                                              type="checkbox"
                                              checked={
                                                variantForm.is_available
                                              }
                                              onChange={(
                                                event,
                                              ) =>
                                                setVariantForm(
                                                  (
                                                    current,
                                                  ) => ({
                                                    ...current,
                                                    is_available:
                                                      event
                                                        .target
                                                        .checked,
                                                  }),
                                                )
                                              }
                                            />{" "}
                                            Available
                                          </label>

                                          <div
                                            style={{
                                              display:
                                                "flex",
                                              gap: "8px",
                                            }}
                                          >
                                            <button
                                              className="primary-button"
                                              type="submit"
                                              disabled={
                                                saving
                                              }
                                            >
                                              {saving
                                                ? "Saving..."
                                                : editingVariantId
                                                  ? "Update variant"
                                                  : "Create variant"}
                                            </button>

                                            <button
                                              className="secondary-button"
                                              type="button"
                                              onClick={
                                                cancelVariantEdit
                                              }
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </form>
                                      )}
                                    </div>

                                    <div
                                      style={{
                                        marginTop: "14px",
                                        paddingTop: "14px",
                                        borderTop:
                                          "1px solid rgba(0,0,0,0.06)",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent:
                                            "space-between",
                                          alignItems:
                                            "center",
                                          gap: "10px",
                                          flexWrap:
                                            "wrap",
                                        }}
                                      >
                                        <strong>
                                          Add-ons
                                        </strong>

                                        <button
                                          className="secondary-button"
                                          type="button"
                                          onClick={() => {
                                            clearMessages();
                                            setAddonForm(
                                              emptyAddonForm,
                                            );
                                            setEditingAddonId(
                                              null,
                                            );
                                            setShowVariantForm(
                                              null,
                                            );
                                            setShowAddonForm(
                                              showAddonForm ===
                                                item.id
                                                ? null
                                                : item.id,
                                            );
                                          }}
                                        >
                                          <Plus size={14} />
                                          Add add-on
                                        </button>
                                      </div>

                                      {item.addons.length ===
                                      0 ? (
                                        <p>
                                          No add-ons added.
                                        </p>
                                      ) : (
                                        <div
                                          style={{
                                            display: "grid",
                                            gap: "6px",
                                            marginTop: "8px",
                                          }}
                                        >
                                          {item.addons.map(
                                            (addon) => (
                                              <div
                                                key={
                                                  addon.id
                                                }
                                                style={{
                                                  display:
                                                    "flex",
                                                  justifyContent:
                                                    "space-between",
                                                  alignItems:
                                                    "center",
                                                  gap: "10px",
                                                  flexWrap:
                                                    "wrap",
                                                }}
                                              >
                                                <span>
                                                  <strong>
                                                    {
                                                      addon.name
                                                    }
                                                  </strong>{" "}
                                                  <small>
                                                    +₹
                                                    {
                                                      addon.price
                                                    }
                                                  </small>{" "}
                                                  <small>
                                                    •{" "}
                                                    {addon.is_available
                                                      ? "Available"
                                                      : "Unavailable"}
                                                  </small>
                                                </span>

                                                <div
                                                  style={{
                                                    display:
                                                      "flex",
                                                    gap: "6px",
                                                  }}
                                                >
                                                  <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() =>
                                                      void toggleAddon(
                                                        addon,
                                                      )
                                                    }
                                                  >
                                                    {addon.is_available
                                                      ? "Disable"
                                                      : "Enable"}
                                                  </button>

                                                  <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() =>
                                                      startAddonEdit(
                                                        addon,
                                                        item.id,
                                                      )
                                                    }
                                                  >
                                                    <Edit3
                                                      size={
                                                        14
                                                      }
                                                    />
                                                  </button>

                                                  <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() =>
                                                      void deleteAddon(
                                                        addon.id,
                                                      )
                                                    }
                                                  >
                                                    <Trash2
                                                      size={
                                                        14
                                                      }
                                                    />
                                                  </button>
                                                </div>
                                              </div>
                                            ),
                                          )}
                                        </div>
                                      )}

                                      {showAddonForm ===
                                        item.id && (
                                        <form
                                          onSubmit={(
                                            event,
                                          ) =>
                                            void saveAddon(
                                              event,
                                              item.id,
                                            )
                                          }
                                          style={{
                                            display:
                                              "grid",
                                            gap: "8px",
                                            marginTop:
                                              "10px",
                                          }}
                                        >
                                          <input
                                            value={
                                              addonForm.name
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              setAddonForm(
                                                (
                                                  current,
                                                ) => ({
                                                  ...current,
                                                  name: event
                                                    .target
                                                    .value,
                                                }),
                                              )
                                            }
                                            placeholder="Add-on name e.g. Extra cheese"
                                            required
                                          />

                                          <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={
                                              addonForm.price
                                            }
                                            onChange={(
                                              event,
                                            ) =>
                                              setAddonForm(
                                                (
                                                  current,
                                                ) => ({
                                                  ...current,
                                                  price:
                                                    event
                                                      .target
                                                      .value,
                                                }),
                                              )
                                            }
                                            placeholder="Add-on price"
                                            required
                                          />

                                          <label>
                                            <input
                                              type="checkbox"
                                              checked={
                                                addonForm.is_available
                                              }
                                              onChange={(
                                                event,
                                              ) =>
                                                setAddonForm(
                                                  (
                                                    current,
                                                  ) => ({
                                                    ...current,
                                                    is_available:
                                                      event
                                                        .target
                                                        .checked,
                                                  }),
                                                )
                                              }
                                            />{" "}
                                            Available
                                          </label>

                                          <div
                                            style={{
                                              display:
                                                "flex",
                                              gap: "8px",
                                            }}
                                          >
                                            <button
                                              className="primary-button"
                                              type="submit"
                                              disabled={
                                                saving
                                              }
                                            >
                                              {saving
                                                ? "Saving..."
                                                : editingAddonId
                                                  ? "Update add-on"
                                                  : "Create add-on"}
                                            </button>

                                            <button
                                              className="secondary-button"
                                              type="button"
                                              onClick={
                                                cancelAddonEdit
                                              }
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </form>
                                      )}
                                    </div>
                                  </div>
                                ),
                              )
                            )}
                          </div>
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </section>

          <section className="travel-panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <span className="eyebrow">
                  Menu items
                </span>

                <h2>Add a menu item</h2>
              </div>

              <button
                className="primary-button"
                onClick={() => {
                  clearMessages();

                  setMenuItemForm({
                    ...emptyMenuItemForm,
                    category:
                      restaurant.categories[0]
                        ? String(
                            restaurant.categories[0].id,
                          )
                        : "",
                  });

                  setEditingMenuItemId(null);

                  setShowMenuItemForm(
                    (value) => !value,
                  );
                }}
                disabled={
                  restaurant.categories.length === 0
                }
              >
                <Plus size={16} />
                Add menu item
              </button>
            </div>

            {restaurant.categories.length === 0 && (
              <p>
                Create a category before adding menu items.
              </p>
            )}

            {showMenuItemForm && (
              <form
                onSubmit={saveMenuItem}
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "18px",
                }}
              >
                <select
                  value={menuItemForm.category}
                  onChange={(event) =>
                    setMenuItemForm((current) => ({
                      ...current,
                      category:
                        event.target.value,
                    }))
                  }
                  required
                >
                  <option value="">
                    Select category
                  </option>

                  {restaurant.categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ),
                  )}
                </select>

                <input
                  value={menuItemForm.name}
                  onChange={(event) =>
                    setMenuItemForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Item name"
                  required
                />

                <textarea
                  value={menuItemForm.description}
                  onChange={(event) =>
                    setMenuItemForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  placeholder="Description"
                  rows={3}
                />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr",
                    gap: "12px",
                  }}
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={menuItemForm.price}
                    onChange={(event) =>
                      setMenuItemForm((current) => ({
                        ...current,
                        price: event.target.value,
                      }))
                    }
                    placeholder="Price"
                    required
                  />

                  <input
                    type="number"
                    min="0"
                    value={
                      menuItemForm.preparation_minutes
                    }
                    onChange={(event) =>
                      setMenuItemForm((current) => ({
                        ...current,
                        preparation_minutes:
                          event.target.value,
                      }))
                    }
                    placeholder="Preparation minutes"
                    required
                  />
                </div>

                <label>
                  <input
                    type="checkbox"
                    checked={
                      menuItemForm.is_vegetarian
                    }
                    onChange={(event) =>
                      setMenuItemForm((current) => ({
                        ...current,
                        is_vegetarian:
                          event.target.checked,
                      }))
                    }
                  />{" "}
                  Vegetarian
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={
                      menuItemForm.is_available
                    }
                    onChange={(event) =>
                      setMenuItemForm((current) => ({
                        ...current,
                        is_available:
                          event.target.checked,
                      }))
                    }
                  />{" "}
                  Available
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                  }}
                >
                  <button
                    className="primary-button"
                    type="submit"
                    disabled={saving}
                  >
                    {saving
                      ? "Saving..."
                      : editingMenuItemId
                        ? "Update item"
                        : "Create item"}
                  </button>

                  <button
                    className="secondary-button"
                    type="button"
                    onClick={cancelMenuItemEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </section>
        </>
      )}
    </main>
  );
}
