import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  ChangeEvent,
  FormEvent,
} from "react";

import {
  Building2,
  CalendarDays,
  Camera,
  CheckCircle2,
  Eye,
  FileText,
  ImagePlus,
  LoaderCircle,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";

import "./ProfilePage.css";
import "./ProviderProfilePage.css";


type VerificationStatus =
  | "pending"
  | "approved"
  | "rejected";


type ProviderDocument = {
  id: number;
  document_type:
    | "business_registration"
    | "identity_proof"
    | "address_proof"
    | "other";
  document_type_display: string;
  document_name: string;
  file: string;
  file_url: string;
  created_at: string;
  updated_at: string;
};


type ProviderProfile = {
  id: number;
  business_name: string;
  business_address: string;
  city: string;
  experience: number;
  description: string;
  verification_status: VerificationStatus;
  rejection_reason: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  avatar_data: string;
  created_at: string;
  updated_at: string;
  documents: ProviderDocument[];
};


type ProfileForm = {
  firstName: string;
  lastName: string;
  phone: string;
  avatarData: string;
  businessName: string;
  businessAddress: string;
  city: string;
  experience: string;
  description: string;
};


type PasswordForm = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};


type DocumentForm = {
  documentType: ProviderDocument["document_type"];
  documentName: string;
  file: File | null;
};


const emptyDocumentForm: DocumentForm = {
  documentType: "business_registration",
  documentName: "",
  file: null,
};


const accountName = (
  profile: ProviderProfile | null,
) =>
  [
    profile?.first_name,
    profile?.last_name,
  ]
    .filter(Boolean)
    .join(" ") ||
  "OneHub provider";


const initials = (
  name: string,
) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(
      (part) =>
        part[0],
    )
    .join("")
    .toUpperCase();


const statusLabel = (
  status: VerificationStatus,
) => {
  if (status === "approved") {
    return "Approved";
  }

  if (status === "rejected") {
    return "Rejected";
  }

  return "Pending review";
};


const formFromProfile = (
  profile: ProviderProfile,
): ProfileForm => ({
  firstName:
    profile.first_name || "",

  lastName:
    profile.last_name || "",

  phone:
    profile.phone || "",

  avatarData:
    profile.avatar_data || "",

  businessName:
    profile.business_name || "",

  businessAddress:
    profile.business_address || "",

  city:
    profile.city || "",

  experience:
    String(
      profile.experience ?? 0,
    ),

  description:
    profile.description || "",
});


export default function ProviderProfilePage() {
  const navigate = useNavigate();

  const logout = useAuthStore(
    (state) => state.logout,
  );

  const updateProfileStore =
    useAuthStore(
      (state) =>
        state.updateProfile,
    );

  const photoInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  const documentInputRef =
    useRef<HTMLInputElement>(
      null,
    );


  const [
    profile,
    setProfile,
  ] = useState<ProviderProfile | null>(
    null,
  );

  const [
    form,
    setForm,
  ] = useState<ProfileForm | null>(
    null,
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  const [
    passwordForm,
    setPasswordForm,
  ] = useState<PasswordForm>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [
    passwordSaving,
    setPasswordSaving,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] = useState("");


  const [
    documentForm,
    setDocumentForm,
  ] = useState<DocumentForm>(
    emptyDocumentForm,
  );

  const [
    documentSaving,
    setDocumentSaving,
  ] = useState(false);

  const [
    documentError,
    setDocumentError,
  ] = useState("");

  const [
    documentSuccess,
    setDocumentSuccess,
  ] = useState("");

  const [
    editingDocumentId,
    setEditingDocumentId,
  ] = useState<number | null>(
    null,
  );

  const [
    showDocumentForm,
    setShowDocumentForm,
  ] = useState(false);


  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get<ProviderProfile>(
          "/providers/me/",
        );

      setProfile(
        response.data,
      );

      setForm(
        formFromProfile(
          response.data,
        ),
      );
    } catch {
      setError(
        "Unable to load your provider profile.",
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    void loadProfile();
  }, []);


  const updateField = (
    field: keyof ProfileForm,
    value: string,
  ) => {
    setError("");
    setSuccess("");

    setForm(
      (current) =>
        current
          ? {
              ...current,
              [field]: value,
            }
          : current,
    );
  };


  const handlePhotoChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setError(
        "Please choose an image file for your profile photo.",
      );
      return;
    }

    if (
      file.size >
      2_000_000
    ) {
      setError(
        "Please choose an image smaller than 2 MB.",
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      updateField(
        "avatarData",
        String(
          reader.result || "",
        ),
      );
    };

    reader.readAsDataURL(
      file,
    );
  };


  const handleProfileSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!form) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response =
        await api.patch<ProviderProfile>(
          "/providers/me/",
          {
            first_name:
              form.firstName.trim(),

            last_name:
              form.lastName.trim(),

            phone:
              form.phone.trim(),

            avatar_data:
              form.avatarData,

            business_name:
              form.businessName.trim(),

            business_address:
              form.businessAddress.trim(),

            city:
              form.city.trim(),

            experience:
              Number(
                form.experience || 0,
              ),

            description:
              form.description.trim(),
          },
        );

      setProfile(
        response.data,
      );

      setForm(
        formFromProfile(
          response.data,
        ),
      );

      /*
       * Keep the global auth store
       * synchronized with the updated
       * personal information.
       */
      try {
        await updateProfileStore({
          first_name:
            form.firstName.trim(),

          last_name:
            form.lastName.trim(),

          phone:
            form.phone.trim(),

          avatar_data:
            form.avatarData,
        });
      } catch {
        /*
         * Provider profile has already
         * been saved successfully.
         */
      }

      setSuccess(
        "Your provider profile has been updated.",
      );
    } catch (
      requestError: any
    ) {
      const data =
        requestError?.response?.data;

      if (
        data &&
        typeof data === "object"
      ) {
        const firstError =
          Object.values(
            data,
          ).find(
            (value) =>
              Array.isArray(
                value,
              ) &&
              value.length > 0,
          );

        if (
          Array.isArray(
            firstError,
          )
        ) {
          setError(
            String(
              firstError[0],
            ),
          );
          return;
        }
      }

      setError(
        "We couldn't save your changes. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };


  const handlePasswordChange =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setPasswordError("");
      setPasswordSuccess("");

      if (
        !passwordForm.oldPassword ||
        !passwordForm.newPassword ||
        !passwordForm.confirmPassword
      ) {
        setPasswordError(
          "Please fill in all password fields.",
        );
        return;
      }

      if (
        passwordForm.newPassword.length <
        8
      ) {
        setPasswordError(
          "New password must be at least 8 characters.",
        );
        return;
      }

      if (
        passwordForm.newPassword !==
        passwordForm.confirmPassword
      ) {
        setPasswordError(
          "New password and confirmation do not match.",
        );
        return;
      }

      if (
        passwordForm.oldPassword ===
        passwordForm.newPassword
      ) {
        setPasswordError(
          "New password must be different from the current password.",
        );
        return;
      }

      setPasswordSaving(true);

      try {
        const response =
          await api.post(
            "/auth/change-password/",
            {
              old_password:
                passwordForm.oldPassword,

              new_password:
                passwordForm.newPassword,
            },
          );

        setPasswordSuccess(
          response.data?.detail ||
            "Password changed successfully.",
        );

        setPasswordForm({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (
        requestError: any
      ) {
        const data =
          requestError?.response?.data;

        if (
          data?.old_password?.[0]
        ) {
          setPasswordError(
            data.old_password[0],
          );
        } else if (
          data?.new_password?.[0]
        ) {
          setPasswordError(
            data.new_password[0],
          );
        } else if (
          data?.detail
        ) {
          setPasswordError(
            data.detail,
          );
        } else {
          setPasswordError(
            "Unable to change password.",
          );
        }
      } finally {
        setPasswordSaving(false);
      }
    };


  const openDocumentForm = (
    document?: ProviderDocument,
  ) => {
    setDocumentError("");
    setDocumentSuccess("");

    if (document) {
      setEditingDocumentId(
        document.id,
      );

      setDocumentForm({
        documentType:
          document.document_type,

        documentName:
          document.document_name,

        file: null,
      });
    } else {
      setEditingDocumentId(
        null,
      );

      setDocumentForm(
        emptyDocumentForm,
      );
    }

    setShowDocumentForm(true);
  };


  const cancelDocumentForm =
    () => {
      setShowDocumentForm(false);
      setEditingDocumentId(
        null,
      );
      setDocumentForm(
        emptyDocumentForm,
      );
      setDocumentError("");
    };


  const handleDocumentFileChange =
    (
      event: ChangeEvent<HTMLInputElement>,
    ) => {
      const file =
        event.target.files?.[0] ||
        null;

      event.target.value = "";

      if (!file) {
        return;
      }

      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
      ];

      if (
        !allowedTypes.includes(
          file.type,
        )
      ) {
        setDocumentError(
          "Only PDF, JPG, JPEG, and PNG files are allowed.",
        );
        return;
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        setDocumentError(
          "Document size must be 10 MB or smaller.",
        );
        return;
      }

      setDocumentError("");

      setDocumentForm(
        (current) => ({
          ...current,
          file,
        }),
      );
    };


  const handleDocumentSubmit =
    async (
      event: FormEvent<HTMLFormElement>,
    ) => {
      event.preventDefault();

      setDocumentError("");
      setDocumentSuccess("");

      if (
        !documentForm.documentName.trim()
      ) {
        setDocumentError(
          "Please enter a document name.",
        );
        return;
      }

      if (
        !editingDocumentId &&
        !documentForm.file
      ) {
        setDocumentError(
          "Please choose a document file.",
        );
        return;
      }

      setDocumentSaving(true);

      try {
        const payload =
          new FormData();

        payload.append(
          "document_type",
          documentForm.documentType,
        );

        payload.append(
          "document_name",
          documentForm.documentName.trim(),
        );

        if (
          documentForm.file
        ) {
          payload.append(
            "file",
            documentForm.file,
          );
        }

        if (
          editingDocumentId
        ) {
          await api.patch(
            `/providers/me/documents/${editingDocumentId}/`,
            payload,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            },
          );

          setDocumentSuccess(
            "Document updated successfully.",
          );
        } else {
          await api.post(
            "/providers/me/documents/",
            payload,
            {
              headers: {
                "Content-Type":
                  "multipart/form-data",
              },
            },
          );

          setDocumentSuccess(
            "Document uploaded successfully.",
          );
        }

        await loadProfile();

        setDocumentForm(
          emptyDocumentForm,
        );

        setEditingDocumentId(
          null,
        );

        setShowDocumentForm(
          false,
        );
      } catch (
        requestError: any
      ) {
        const data =
          requestError?.response?.data;

        if (
          data &&
          typeof data === "object"
        ) {
          const firstError =
            Object.values(
              data,
            ).find(
              (value) =>
                Array.isArray(
                  value,
                ) &&
                value.length > 0,
            );

          if (
            Array.isArray(
              firstError,
            )
          ) {
            setDocumentError(
              String(
                firstError[0],
              ),
            );
            return;
          }
        }

        setDocumentError(
          "Unable to save the document.",
        );
      } finally {
        setDocumentSaving(false);
      }
    };


  const deleteDocument =
    async (
      documentId: number,
    ) => {
      const confirmed =
        window.confirm(
          "Delete this verification document?",
        );

      if (!confirmed) {
        return;
      }

      setDocumentError("");
      setDocumentSuccess("");

      try {
        await api.delete(
          `/providers/me/documents/${documentId}/`,
        );

        await loadProfile();

        setDocumentSuccess(
          "Document deleted successfully.",
        );
      } catch {
        setDocumentError(
          "Unable to delete the document.",
        );
      }
    };


  const handleLogout = () => {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      },
    );
  };


  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-loading">
          <LoaderCircle
            size={24}
            className="profile-spin"
          />

          Loading your provider profile...
        </div>
      </main>
    );
  }


  if (
    error &&
    !profile
  ) {
    return (
      <main className="profile-page">
        <div className="profile-form-message profile-form-message--error">
          {error}
        </div>
      </main>
    );
  }


  if (
    !profile ||
    !form
  ) {
    return (
      <main className="profile-page">
        <div className="profile-form-message profile-form-message--error">
          Provider profile not found.
        </div>
      </main>
    );
  }


  const name =
    accountName(profile);

  const joined =
    profile.created_at
      ? new Intl.DateTimeFormat(
          "en",
          {
            month: "short",
            year: "numeric",
          },
        ).format(
          new Date(
            profile.created_at,
          ),
        )
      : "Recently";


  return (
    <main className="profile-page">

      {/* ================= HEADER ================= */}

      <header className="profile-page__heading">
        <div>
          <span className="eyebrow">
            Account settings
          </span>

          <h1>
            Profile & preferences
          </h1>

          <p>
            Keep your provider details,
            business information and
            verification documents current.
          </p>
        </div>

        <span
          className={`profile-verified provider-status provider-status--${profile.verification_status}`}
        >
          <CheckCircle2
            size={16}
          />

          {statusLabel(
            profile.verification_status,
          )}
        </span>
      </header>


      {/* ================= HERO ================= */}

      <section className="profile-hero">

        <div className="profile-avatar-wrap">

          <div
            className="profile-avatar"
            aria-label={`${name} profile photo`}
          >
            {form.avatarData ? (
              <img
                src={form.avatarData}
                alt=""
              />
            ) : (
              <span>
                {initials(name)}
              </span>
            )}
          </div>

          <button
            className="profile-avatar-action"
            type="button"
            onClick={() =>
              photoInputRef.current?.click()
            }
            aria-label="Change profile photo"
          >
            <Camera size={15} />
          </button>

          <input
            ref={photoInputRef}
            className="sr-only"
            type="file"
            accept="image/*"
            onChange={
              handlePhotoChange
            }
          />
        </div>


        <div className="profile-hero__identity">

          <span className="profile-role">
            Provider account
          </span>

          <h2>
            {name}
          </h2>

          <div className="profile-hero__contact">

            <span>
              <Mail size={15} />

              {profile.email ||
                "No email available"}
            </span>

            <span>
              <Phone size={15} />

              {profile.phone ||
                "Add phone number"}
            </span>

          </div>
        </div>


        <div className="profile-hero__meta">

          <span>
            Member since
          </span>

          <strong>
            {joined}
          </strong>

        </div>

      </section>


      {/* ================= MAIN ================= */}

      <div className="profile-layout">

        <div className="provider-profile-main">


          {/* ================= PERSONAL DETAILS ================= */}

          <form
            className="profile-card profile-form-card"
            onSubmit={
              handleProfileSubmit
            }
          >

            <div className="profile-card__heading">

              <div>

                <span className="eyebrow">
                  Personal information
                </span>

                <h2>
                  Your details
                </h2>

                <p>
                  Keep the account information
                  associated with your provider
                  profile up to date.
                </p>

              </div>

              <button
                className="profile-photo-link"
                type="button"
                onClick={() =>
                  photoInputRef.current?.click()
                }
              >
                <ImagePlus size={16} />

                Change photo
              </button>

            </div>


            <div className="profile-form-grid">

              <label>
                <span>
                  First name
                </span>

                <input
                  value={
                    form.firstName
                  }
                  onChange={(event) =>
                    updateField(
                      "firstName",
                      event.target.value,
                    )
                  }
                  placeholder="Your first name"
                  required
                />
              </label>


              <label>
                <span>
                  Last name
                </span>

                <input
                  value={
                    form.lastName
                  }
                  onChange={(event) =>
                    updateField(
                      "lastName",
                      event.target.value,
                    )
                  }
                  placeholder="Your last name"
                  required
                />
              </label>


              <label className="profile-form-grid__wide">

                <span>
                  Email address

                  <small>
                    Verified
                  </small>
                </span>

                <div className="profile-input-with-icon profile-input-with-icon--locked">

                  <Mail size={17} />

                  <input
                    value={
                      profile.email
                    }
                    readOnly
                    aria-label="Email address"
                  />

                  <ShieldCheck
                    size={17}
                  />

                </div>

                <em>
                  Your email is used to
                  sign in and cannot be
                  changed here.
                </em>

              </label>


              <label>

                <span>
                  Phone number
                </span>

                <div className="profile-input-with-icon">

                  <Phone size={17} />

                  <input
                    value={
                      form.phone
                    }
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value,
                      )
                    }
                    placeholder="Your mobile number"
                    inputMode="tel"
                  />

                </div>

              </label>


              <label>

                <span>
                  Provider since
                </span>

                <div className="profile-input-with-icon profile-input-with-icon--locked">

                  <CalendarDays
                    size={17}
                  />

                  <input
                    value={joined}
                    readOnly
                    aria-label="Provider since"
                  />

                </div>

              </label>

            </div>


            <div className="profile-form-divider" />


            {/* ================= BUSINESS ================= */}

            <div className="profile-card__heading profile-card__heading--compact">

              <div>

                <span className="eyebrow">
                  Business information
                </span>

                <h2>
                  Your business
                </h2>

                <p>
                  These details are displayed
                  across your provider workspace
                  and used during verification.
                </p>

              </div>

            </div>


            <div className="profile-form-grid">

              <label className="profile-form-grid__wide">

                <span>
                  Business name
                </span>

                <div className="profile-input-with-icon">

                  <Building2
                    size={17}
                  />

                  <input
                    value={
                      form.businessName
                    }
                    onChange={(event) =>
                      updateField(
                        "businessName",
                        event.target.value,
                      )
                    }
                    placeholder="Your registered business name"
                    required
                  />

                </div>

              </label>


              <label className="profile-form-grid__wide">

                <span>
                  Business address
                </span>

                <div className="profile-input-with-icon profile-input-with-icon--textarea">

                  <MapPin
                    size={17}
                  />

                  <textarea
                    value={
                      form.businessAddress
                    }
                    onChange={(event) =>
                      updateField(
                        "businessAddress",
                        event.target.value,
                      )
                    }
                    placeholder="Full business address"
                    rows={3}
                    required
                  />

                </div>

              </label>


              <label>

                <span>
                  City
                </span>

                <div className="profile-input-with-icon">

                  <MapPin
                    size={17}
                  />

                  <input
                    value={
                      form.city
                    }
                    onChange={(event) =>
                      updateField(
                        "city",
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Hyderabad"
                    required
                  />

                </div>

              </label>


              <label>

                <span>
                  Experience
                </span>

                <div className="provider-number-field">

                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={
                      form.experience
                    }
                    onChange={(event) =>
                      updateField(
                        "experience",
                        event.target.value,
                      )
                    }
                  />

                  <span>
                    years
                  </span>

                </div>

              </label>


              <label className="profile-form-grid__wide">

                <span>
                  Business description
                </span>

                <textarea
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Tell customers about your business and services."
                  rows={4}
                />

              </label>

            </div>


            {error && (
              <p
                className="profile-form-message profile-form-message--error"
                role="alert"
              >
                {error}
              </p>
            )}


            {success && (
              <p
                className="profile-form-message profile-form-message--success"
                role="status"
              >
                <CheckCircle2
                  size={17}
                />

                {success}
              </p>
            )}


            <div className="profile-form-actions">

              {form.avatarData && (
                <button
                  className="profile-reset"
                  type="button"
                  onClick={() =>
                    updateField(
                      "avatarData",
                      "",
                    )
                  }
                >
                  <X size={16} />

                  Remove photo
                </button>
              )}

              <button
                className="profile-save"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <LoaderCircle
                    size={17}
                    className="profile-spin"
                  />
                ) : (
                  <CheckCircle2
                    size={17}
                  />
                )}

                {saving
                  ? "Saving changes..."
                  : "Save changes"}
              </button>

            </div>

          </form>


          {/* ================= DOCUMENTS ================= */}

          <section className="profile-card provider-documents-card">

            <div className="profile-card__heading">

              <div>

                <span className="eyebrow">
                  Verification documents
                </span>

                <h2>
                  Your documents
                </h2>

                <p>
                  Keep your provider verification
                  documents available and up to date.
                </p>

              </div>

              <button
                className="provider-document-add"
                type="button"
                onClick={() =>
                  openDocumentForm()
                }
              >
                <Plus size={16} />

                Add document
              </button>

            </div>


            {documentError && (
              <p className="profile-form-message profile-form-message--error">
                {documentError}
              </p>
            )}


            {documentSuccess && (
              <p className="profile-form-message profile-form-message--success">
                <CheckCircle2
                  size={17}
                />

                {documentSuccess}
              </p>
            )}


            {profile.documents.length ===
            0 ? (
              <div className="provider-documents-empty">

                <div className="provider-empty-icon">
                  <FileText size={24} />
                </div>

                <strong>
                  No documents uploaded yet
                </strong>

                <p>
                  Upload your verification documents
                  to keep your provider application
                  complete.
                </p>

                <button
                  type="button"
                  className="profile-save"
                  onClick={() =>
                    openDocumentForm()
                  }
                >
                  <Upload size={16} />

                  Upload document
                </button>

              </div>
            ) : (
              <div className="provider-document-list">

                {profile.documents.map(
                  (document) => (
                    <article
                      className="provider-document-item"
                      key={
                        document.id
                      }
                    >

                      <div className="provider-document-icon">
                        <FileText
                          size={21}
                        />
                      </div>


                      <div className="provider-document-info">

                        <span className="provider-document-type">
                          {
                            document.document_type_display
                          }
                        </span>

                        <strong>
                          {
                            document.document_name
                          }
                        </strong>

                        <small>
                          Uploaded{" "}
                          {new Intl.DateTimeFormat(
                            "en",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          ).format(
                            new Date(
                              document.created_at,
                            ),
                          )}
                        </small>

                      </div>


                      <div className="provider-document-actions">

                        <a
                          href={
                            document.file_url
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="provider-document-button"
                          title="View document"
                        >
                          <Eye
                            size={16}
                          />

                          View
                        </a>

                        <button
                          type="button"
                          className="provider-document-button"
                          onClick={() =>
                            openDocumentForm(
                              document,
                            )
                          }
                        >
                          <Upload
                            size={16}
                          />

                          Change
                        </button>

                        <button
                          type="button"
                          className="provider-document-button provider-document-button--danger"
                          onClick={() =>
                            void deleteDocument(
                              document.id,
                            )
                          }
                          title="Delete document"
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                    </article>
                  ),
                )}

              </div>
            )}


            {/* ================= DOCUMENT FORM ================= */}

            {showDocumentForm && (
              <div className="provider-document-editor">

                <div className="provider-document-editor__header">

                  <div>

                    <span className="eyebrow">
                      {editingDocumentId
                        ? "Replace document"
                        : "New document"}
                    </span>

                    <h3>
                      {editingDocumentId
                        ? "Change verification document"
                        : "Upload verification document"}
                    </h3>

                  </div>

                  <button
                    type="button"
                    className="provider-close-button"
                    onClick={
                      cancelDocumentForm
                    }
                  >
                    <X size={18} />
                  </button>

                </div>


                <form
                  onSubmit={
                    handleDocumentSubmit
                  }
                >

                  <div className="profile-form-grid">

                    <label>

                      <span>
                        Document type
                      </span>

                      <select
                        value={
                          documentForm.documentType
                        }
                        onChange={(event) =>
                          setDocumentForm(
                            (current) => ({
                              ...current,
                              documentType:
                                event.target
                                  .value as ProviderDocument["document_type"],
                            }),
                          )
                        }
                      >
                        <option value="business_registration">
                          Business Registration
                        </option>

                        <option value="identity_proof">
                          Identity Proof
                        </option>

                        <option value="address_proof">
                          Address Proof
                        </option>

                        <option value="other">
                          Other
                        </option>
                      </select>

                    </label>


                    <label>

                      <span>
                        Document name
                      </span>

                      <input
                        value={
                          documentForm.documentName
                        }
                        onChange={(event) =>
                          setDocumentForm(
                            (current) => ({
                              ...current,
                              documentName:
                                event.target
                                  .value,
                            }),
                          )
                        }
                        placeholder="e.g. GST Certificate"
                        required
                      />

                    </label>


                    <label className="profile-form-grid__wide">

                      <span>
                        File
                      </span>

                      <div className="provider-file-picker">

                        <input
                          ref={
                            documentInputRef
                          }
                          className="sr-only"
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={
                            handleDocumentFileChange
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            documentInputRef.current?.click()
                          }
                        >
                          <Upload
                            size={17}
                          />

                          {documentForm.file
                            ? documentForm.file.name
                            : editingDocumentId
                              ? "Choose replacement file"
                              : "Choose document"}
                        </button>

                        <small>
                          PDF, JPG, JPEG or PNG ·
                          Maximum 10 MB
                        </small>

                      </div>

                    </label>

                  </div>


                  {documentError && (
                    <p className="profile-form-message profile-form-message--error">
                      {documentError}
                    </p>
                  )}


                  <div className="provider-document-editor__actions">

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={
                        cancelDocumentForm
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="profile-save"
                      disabled={
                        documentSaving
                      }
                    >
                      {documentSaving ? (
                        <LoaderCircle
                          size={16}
                          className="profile-spin"
                        />
                      ) : (
                        <CheckCircle2
                          size={16}
                        />
                      )}

                      {documentSaving
                        ? "Saving..."
                        : editingDocumentId
                          ? "Replace document"
                          : "Upload document"}
                    </button>

                  </div>

                </form>

              </div>
            )}

          </section>


          {/* ================= PASSWORD ================= */}

          <section className="profile-card profile-form-card">

            <div className="profile-card__heading">

              <div>

                <span className="eyebrow">
                  Account security
                </span>

                <h2>
                  Change password
                </h2>

                <p>
                  Update the password used to
                  sign in to your OneHub provider
                  account.
                </p>

              </div>

              <ShieldCheck
                size={25}
                className="provider-security-icon"
              />

            </div>


            <form
              onSubmit={
                handlePasswordChange
              }
            >

              <div className="profile-form-grid">

                <label className="profile-form-grid__wide">

                  <span>
                    Current password
                  </span>

                  <div className="profile-input-with-icon">

                    <Lock size={17} />

                    <input
                      type="password"
                      value={
                        passwordForm.oldPassword
                      }
                      onChange={(event) =>
                        setPasswordForm(
                          (current) => ({
                            ...current,
                            oldPassword:
                              event.target
                                .value,
                          }),
                        )
                      }
                      autoComplete="current-password"
                      placeholder="Enter your current password"
                      required
                    />

                  </div>

                </label>


                <label>

                  <span>
                    New password
                  </span>

                  <div className="profile-input-with-icon">

                    <Lock size={17} />

                    <input
                      type="password"
                      value={
                        passwordForm.newPassword
                      }
                      onChange={(event) =>
                        setPasswordForm(
                          (current) => ({
                            ...current,
                            newPassword:
                              event.target
                                .value,
                          }),
                        )
                      }
                      autoComplete="new-password"
                      placeholder="Minimum 8 characters"
                      required
                    />

                  </div>

                </label>


                <label>

                  <span>
                    Confirm password
                  </span>

                  <div className="profile-input-with-icon">

                    <Lock size={17} />

                    <input
                      type="password"
                      value={
                        passwordForm.confirmPassword
                      }
                      onChange={(event) =>
                        setPasswordForm(
                          (current) => ({
                            ...current,
                            confirmPassword:
                              event.target
                                .value,
                          }),
                        )
                      }
                      autoComplete="new-password"
                      placeholder="Repeat new password"
                      required
                    />

                  </div>

                </label>

              </div>


              {passwordError && (
                <p className="profile-form-message profile-form-message--error">
                  {passwordError}
                </p>
              )}


              {passwordSuccess && (
                <p className="profile-form-message profile-form-message--success">
                  <CheckCircle2
                    size={17}
                  />

                  {passwordSuccess}
                </p>
              )}


              <div className="profile-form-actions">

                <span className="provider-password-hint">
                  Use a unique password with at least
                  8 characters.
                </span>

                <button
                  className="profile-save"
                  type="submit"
                  disabled={
                    passwordSaving
                  }
                >
                  {passwordSaving ? (
                    <LoaderCircle
                      size={17}
                      className="profile-spin"
                    />
                  ) : (
                    <Lock
                      size={17}
                    />
                  )}

                  {passwordSaving
                    ? "Changing password..."
                    : "Change password"}
                </button>

              </div>

            </form>

          </section>

        </div>


        {/* ================= SIDEBAR ================= */}

        <aside className="profile-sidebar">


          {/* ACCOUNT STATUS */}

          <section className="profile-card profile-status-card">

            <span className="eyebrow">
              Account at a glance
            </span>

            <h2>
              Provider account
            </h2>

            <ul>

              <li>

                <span className="profile-status-icon">
                  <CheckCircle2
                    size={16}
                  />
                </span>

                <span>
                  <strong>
                    Email verified
                  </strong>

                  <small>
                    Your sign-in email is confirmed.
                  </small>
                </span>

              </li>


              <li>

                <span className="profile-status-icon">
                  <ShieldCheck
                    size={16}
                  />
                </span>

                <span>
                  <strong>
                    Account secured
                  </strong>

                  <small>
                    Your profile is protected by your password.
                  </small>
                </span>

              </li>


              <li>

                <span className="profile-status-icon">
                  <Building2
                    size={16}
                  />
                </span>

                <span>
                  <strong>
                    Business registered
                  </strong>

                  <small>
                    {profile.business_name ||
                      "Business details pending"}
                  </small>
                </span>

              </li>


              <li>

                <span
                  className={`provider-status-dot provider-status-dot--${profile.verification_status}`}
                />

                <span>
                  <strong>
                    Verification
                  </strong>

                  <small>
                    {statusLabel(
                      profile.verification_status,
                    )}
                  </small>
                </span>

              </li>

            </ul>

          </section>


          {/* VERIFICATION CARD */}

          <section className="profile-tip-card provider-verification-card">

            <ShieldCheck
              size={21}
            />

            <div>

              <strong>
                Verification status
              </strong>

              <p>
                Your provider account is currently{" "}
                <b>
                  {statusLabel(
                    profile.verification_status,
                  )}
                </b>
                .
              </p>

              {profile.rejection_reason && (
                <div className="provider-rejection">

                  <span>
                    Reason
                  </span>

                  <p>
                    {
                      profile.rejection_reason
                    }
                  </p>

                </div>
              )}

            </div>

          </section>


          {/* DOCUMENT SUMMARY */}

          <section className="profile-card provider-document-summary">

            <span className="eyebrow">
              Verification documents
            </span>

            <h2>
              {profile.documents.length}
            </h2>

            <p>
              document
              {profile.documents.length ===
              1
                ? ""
                : "s"} uploaded
            </p>

            <button
              type="button"
              onClick={() =>
                openDocumentForm()
              }
            >
              <Upload
                size={15}
              />

              Upload another

            </button>

          </section>

        </aside>

      </div>


      {/* ================= SIGN OUT ================= */}

      <section className="profile-signout">

        <div>

          <strong>
            Signed in on this device
          </strong>

          <span>
            Sign out when you are using a shared
            computer.
          </span>

        </div>

        <button
          type="button"
          onClick={
            handleLogout
          }
        >
          <LogOut size={17} />

          Sign out
        </button>

      </section>

    </main>
  );
}