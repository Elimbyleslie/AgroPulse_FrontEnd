export const ROUTES = {
  // -----------------------------
  // AUTH
  // -----------------------------
  AUTH_LOGIN: "auth/login",
  AUTH_REGISTER: "auth/register",
  AUTH_VERIFY_OTP: "auth/verify-otp",
  AUTH_RESEND_OTP: "auth/resend-otp",
  AUTH_REFRESH_TOKEN: "auth/refresh",
  AUTH_LOGOUT: "auth/logout",
  AUTH_VERIFY_EMAIL_OTP: "auth/verify-email-otp",
  AUTH_SEND_EMAIL_VERIFICATION :"auth/send-email-verification-otp",
  AUTH_RESET_PASSWORD : "auth/reset-password",
  AUTH_UPDATE_PASSWORD : "auth/update-password", 
  AUTH_CHANGE_PASSWORD : "auth/change-password",
  PROFILE : "users/profile",
  AUTH_ME: "auth/me",


  // -----------------------------
  // ORGANIZATIONS (SaaS)
  // -----------------------------
  ORGANIZATION_LIST: "organizations",
  ORGANIZATION_CREATE: "organizations",
  ORGANIZATION_UPDATE: (id: string | number) => `organizations/${id}`,
  ORGANIZATION_DELETE: (id: string | number) => `organizations/${id}`,
  ORGANIZATION_GET_BY_ID: (id: string | number) => `organizations/${id}`,

  // PLANS
  PLAN_LIST: "plan",
  PLAN_CREATE: "plan",
  PLAN_UPDATE: (id: string | number) => `plan/${id}`,
  PLAN_DELETE: (id: string | number) => `plan/${id}`,
  PLAN_GET_BY_ID: (id: string | number) => `plan/${id}`,

  // AUDIT LOGS
  AUDIT_LIST: "audit",
  AUDIT_CREATE: "audit",

  // API KEYS
  API_KEY_LIST: "APIKey",
  API_KEY_CREATE: "APIKey",
  API_KEY_UPDATE: (id: string | number) => `APIKey/${id}`,
  API_KEY_DELETE: (id: string | number) => `APIKey/${id}`,

  // USERS
  USER_LIST: "users",
  USER_CREATE: "users",
  USER_UPDATE: (id: string | number) => `users/${id}`,
  USER_DELETE: (id: string | number) => `users/${id}`,
  USER_GET_BY_ID: (id: string | number) => `users/${id}`,

  // -----------------------------
  // ANIMALS MANAGEMENT
  // -----------------------------
  ANIMAL_LIST: "animals",
  ANIMAL_CREATE: "animals",
  ANIMAL_UPDATE: (id: string | number) => `animals/${id}`,
  ANIMAL_DELETE: (id: string | number) => `animals/${id}`,
  ANIMAL_GET_BY_ID: "animals",

  BIRTH_LIST: "births",
  BIRTH_CREATE: "births",
  BIRTH_UPDATE: (id: string | number) => `births/${id}`,
  BIRTH_DELETE: (id: string | number) => `births/${id}`,

  ANIMAL_REPRODUCTION_LIST: "animal-reproductions",
  ANIMAL_REPRODUCTION_CREATE: "animal-reproductions",

  ANIMAL_REPRODUCTION_UPDATE: (id: string | number) =>
    `animal-reproductions/${id}`,
  ANIMAL_REPRODUCTION_DELETE: (id: string | number) =>
    `animal-reproductions/${id}`,

  REPRODUCTION_LIST: "reproductions",
  REPRODUCTION_CREATE: "reproductions",
  REPRODUCTION_UPDATE: (id: string | number) => `reproductions/${id}`,
  REPRODUCTION_DELETE: (id: string | number) => `reproductions/${id}`,

  ANIMAL_HEALTH_LIST: "animal-health",
  ANIMAL_HEALTH_CREATE: "animal-health",
  ANIMAL_HEALTH_UPDATE: (id: string | number) => `animal-health/${id}`,
  ANIMAL_HEALTH_DELETE: (id: string | number) => `animal-health/${id}`,

  ANIMAL_TREATMENT_LIST: "animal-treatments",
  ANIMAL_TREATMENT_CREATE: "animal-treatments",
  ANIMAL_TREATMENT_UPDATE: (id: string | number) =>
    `animal-treatments/${id}`,
  ANIMAL_TREATMENT_DELETE: (id: string | number) =>
    `animal-treatments/${id}`,

  ANIMAL_VACCINATION_LIST: "animal-vaccinations",
  ANIMAL_VACCINATION_CREATE: "animal-vaccinations",
  ANIMAL_VACCINATION_UPDATE: (id: string | number) =>
    `animal-vaccinations/${id}`,
  ANIMAL_VACCINATION_DELETE: (id: string | number) =>
    `animal-vaccinations/${id}`,

  ANIMAL_DEATH_LIST: "animal-deaths",
  ANIMAL_DEATH_CREATE: "animal-deaths",
  ANIMAL_DEATH_UPDATE: (id: string | number) => `animal-deaths/${id}`,
  ANIMAL_DEATH_DELETE: (id: string | number) => `animal-deaths/${id}`,

  ANIMAL_TRANSFER_LIST: "animal-transfers",
  ANIMAL_TRANSFER_CREATE: "animal-transfers",
  ANIMAL_TRANSFER_UPDATE: (id: string | number) =>
    `animal-transfers/${id}`,
  ANIMAL_TRANSFER_DELETE: (id: string | number) =>
    `animal-transfers/${id}`,

  ANIMAL_WEIGHT_LIST: "animal-weights",
  ANIMAL_WEIGHT_CREATE: "animal-weights",
  ANIMAL_WEIGHT_UPDATE: (id: string | number) => `animal-weights/${id}`,

  ANIMAL_MOVEMENT_LIST: "animal-movements",
  ANIMAL_MOVEMENT_CREATE: "animal-movements",
  ANIMAL_MOVEMENT_UPDATE: (id: string | number) =>
    `animal-movements/${id}`,

  ANIMAL_FEEDING_LIST: "animal-feedings",
  ANIMAL_FEEDING_CREATE: "animal-feedings",
  ANIMAL_FEEDING_UPDATE: (id: string | number) =>
    `animal-feedings/${id}`,

  // -----------------------------
  // FARMS & INFRASTRUCTURES
  // -----------------------------
  FARM_LIST: "farms",
  FARM_CREATE: "farms",
  FARM_GET_BY_ID: (id: string | number) => `farms/${id}`,
  FARM_UPDATE: (id: string | number) => `farms/${id}`,
  FARM_DELETE: (id: string | number) => `farms/${id}`,
  MY_FARMS: "farms/myfarms",

  FARM_TASK_LIST: "FarmTasks",
  FARM_TASK_CREATE: "FarmTasks",
  FARM_TASK_UPDATE: (id: string | number) => `FarmTasks/${id}`,
  FARM_TASK_DELETE: (id: string | number) => `FarmTasks/${id}`,

  BARN_LIST: "barns",
  BARN_CREATE: "barns",
  BARN_GET_BY_ID: (id: string | number) => `barns/${id}`,
  BARN_DELETE: (id: string | number) => `barns/${id}`,
  BARN_UPDATE: (id: string | number) => `barns/${id}`,

  PEN_LIST: "pens",
  PEN_CREATE: "pens",
  PEN_UPDATE: (id: string | number) => `pens/${id}`,
  PEN_DELETE: (id: string | number) => `pens/${id}`,
  GET_PEN_BY_ID: "pens",

  // -----------------------------
  // BIOLOGICAL MANAGEMENT
  // -----------------------------
  BREED_LIST: "breeds",
  BREED_CREATE: "breeds",
  BREED_UPDATE: (id: string | number) => `breeds/${id}`,

  SPECIES_LIST: "species",
  SPECIES_CREATE: "species",
  SPECIES_UPDATE: (id: string | number) => `species/${id}`,

  HERD_LIST: "herds",
  HERD_CREATE: "herds",
  HERD_UPDATE: (id: string | number) => `herds/${id}`,
  HERD_DELETE: (id: string | number) => `herds/${id}`,
  GET_HERD_BY_ID: "herds",

  LOT_LIST: "lots",
  LOT_CREATE: "lots",
  LOT_UPDATE: (id: string | number) => `lots/${id}`,
  LOT_DELETE: (id: string | number) => `lots/${id}`,
  GET_LOT_BY_ID : "lots",

  // -----------------------------
  // STRUCTURAL MANAGEMENT
  // -----------------------------
  EXPENSE_CATEGORY_LIST: "expense-categories",
  EXPENSE_CATEGORY_CREATE: "expense-categories",

  EXPENSE_LIST: "expenses",
  EXPENSE_CREATE: "expenses",

  SALE_LIST: "sales",
  SALE_CREATE: "sales",

  SALE_ITEM_LIST: "sale-items",
  SALE_ITEM_CREATE: "sale-items",

  // -----------------------------
  // PRODUCTION
  // -----------------------------
  PRODUCTION_LIST: "productions",
  PRODUCTION_CREATE: "productions",

  // -----------------------------
  // FINANCE
  // -----------------------------
  PAYMENT_LIST: "payments",
  PAYMENT_CREATE: "payments",

  PURCHASE_LIST: "purchases",
  PURCHASE_CREATE: "purchases",

  INVOICE_LIST: "Invoices",
  INVOICE_CREATE: "Invoices",

  // -----------------------------
  // EQUIPMENT & MAINTENANCE
  // -----------------------------
  EQUIPMENT_MAINTENANCE_LIST: "equipment-maintenances",
  EQUIPMENT_MAINTENANCE_CREATE: "equipment-maintenances",

  EQUIPMENT_LIST: "equipments",
  EQUIPMENT_CREATE: "equipments",

  // -----------------------------
  // STOCK & INVENTORY
  // -----------------------------
  FEEDSTOCK_LIST: "Feedstocks",
  FEEDSTOCK_CREATE: "Feedstocks",

  FEED_USAGE_LIST: "FeedUsages",
  FEED_USAGE_CREATE: "FeedUsages",

  INVENTORY_LIST: "inventories",
  INVENTORY_CREATE: "inventories",

  SUPPLIER_LIST: "Suppliers",
  SUPPLIER_CREATE: "Suppliers",
  SUPPLIER_UPDATE: (id: string | number) => `Suppliers/${id}`,
  SUPPLIER_DELETE: (id: string | number) => `Suppliers/${id}`,

  FEED_PURCHASE_LIST: "FeedPurchases",
  FEED_PURCHASE_CREATE: "FeedPurchases",
  FEED_PURCHASE_UPDATE: (id: string | number) => `FeedPurchases/${id}`,
  FEED_PURCHASE_DELETE: (id: string | number) => `FeedPurchases/${id}`,

  // -----------------------------
  // NOTIFICATIONS
  // -----------------------------
  NOTIFICATION_LIST: "notifications",
  NOTIFICATION_CREATE: "notifications",

  ALERT_LIST: "alerts",
  ALERT_CREATE: "alerts",
};
