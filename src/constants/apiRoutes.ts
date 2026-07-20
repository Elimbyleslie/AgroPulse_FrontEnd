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
  CLIENT_LIST :"clients",
  CLIENT_CREATE :"clients",
  CLIENT_UPDATE :(id: string | number) => `clients/${id}`,
  CLIENT_DELETE :(id: string | number) => `clients/${id}`,
  CLIENT_GET_BY_ID: (id: string | number) => `clients/${id}`,
  
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
  ASSIGNANIMALTOLPH: "animals/assign",
  UNASSIGNANIMALFROMLPH: "animals/unassign",

  BIRTH_LIST: "births",
  BIRTH_CREATE: "births",
  BIRTH_UPDATE: (id: string | number) => `births/${id}`,
  BIRTH_DELETE: (id: string | number) => `births/${id}`,
  BIRTH_BY_ID: (id: string | number) =>   `birth/${id}`,

  REPRODUCTION_BIRTH_LIST: "reproduction-with-birth",
  REPRODUCTION_BIRTH_CREATE: "reproduction-with-birth",
  REPRODUCTION_BIRTH_UPDATE: (id: string | number) => `reproduction-with-birth/${id}`,
  REPRODUCTION_BIRTH_DELETE: (id: string | number) =>
    `reproduction-with-birth/${id}`,
  REPRODUCTION_BIRTH_GET_BY_ID: (id: string | number) =>
    `reproduction-with-birth/${id}`,

  LIST_CONSULTATIONS: "animal-health",
  CREATE_CONSULTATION: "animal-health",
  UPDATE_CONSULTATION: (id: string | number) => `animal-health/${id}`,
  DELETE_CONSULTATION: (id: string | number) => `animal-health/${id}`,
  GET_CONSULTATION_BY_ID: "animal-health",


  ANIMAL_REPRODUCTION_LIST : "animal-reproductions",
  ANIMAL_REPRODUCTION_CREATE: "animal-reproductions",
  ANIMAL_REPRODUCTION_UPDATE: (id: string | number) => `animal-reproductions/${id}`,
  ANIMAL_REPRODUCTION_DELETE: (id: string | number) =>
    `animal-reproductions/${id}`,
  ANIMAL_REPRODUCTION_GET_BY_ID: (id: string | number) => `animal-reproductions/${id}`,



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
  ANIMAL_VACCINATION_GET_BY_ID: "animal-vaccinations",

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
  ANIMAL_FEEDING_DELETE: ( id : string | number) => `animal-feedings/${id}`,

  ANIMAL_FEEDING_GET_BY_ID : "animal-feedings",

  FEEDING_PLAN_LIST : "feedingPlan",
  FEEDING_PLAN_CREATE:   "feedingPlan",
  FEEDING_PLAN_GET_BY_ID:  "feedingPlan",
  FEEDING_PLAN_UPDATE: (id: string | number) => `feedingPlan/${id}`,
  FEEDING_PLAN_DELETE: (id: string | number) => `feedingPlan/${id}`,
  FEEDING_PLAN_DISTRIBUTE: (id : string | number) => `feedingPlan/${id}/distribute`,

  FEED_STOCK_LIST: "feedStocks",
  FEED_STOCK_CREATE: "feedStocks",
  FEED_STOCK_UPDATE: (id: string | number) => `feedStocks/${id}`,
  FEED_STOCK_DELETE: (id: string | number) => `feedStocks/${id}`,
  FEED_STOCK_GET_BY_ID: "feedStocks",
  
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
  PRODUCTION_UPDATE: (id: string | number) => `productions/${id}`,
  PRODUCTION_DELETE: (id: string | number) => `productions/${id}`,
  PRODUCTION_GET_BY_ID: (id: string | number) => `productions/${id}`,
  PRODUCTION_STATS: "productions/stats",  
  // -----------------------------
  // FINANCE
  // -----------------------------
  PAYMENT_LIST: "payments",
  PAYMENT_CREATE: "payments",
  PAYMENT_UPDATE: (id: string | number) => `payments/${id}`,
  PAYMENT_DELETE: (id: string | number) => `payments/${id}`,
  PAYMENT_GET_BY_ID: "payments",

  PURCHASE_LIST: "purchases",
  PURCHASE_CREATE: "purchases",
  PURCHASE_UPDATE: (id: string | number) => `purchases/${id}`,
  PURCHASE_DELETE: (id: string | number) => `purchases/${id}`,
  PURCHASE_GET_BY_ID:"purchases",

  INVOICE_LIST: "Invoices",
  INVOICE_CREATE: "Invoices",
  INVOICE_UPDATE: (id: string | number) => `Invoices/${id}`,
  INVOICE_DELETE: (id: string | number) => `Invoices/${id}`,
  INVOICE_GET_BY_ID: "Invoices",

  // -----------------------------
  // EQUIPMENT & MAINTENANCE
  // -----------------------------
  EQUIPMENT_MAINTENANCE_LIST: "equipment-maintenances",
  EQUIPMENT_MAINTENANCE_CREATE: "equipment-maintenances",
  EQUIPMENT_MAINTENANCE_UPDATE: (id: string | number) => `equipment-maintenances/${id}`,
  EQUIPMENT_MAINTENANCE_DELETE: (id: string | number) => `equipment-maintenances/${id}`,
  EQUIPMENT_MAINTENANCE_GET_BY_ID: "equipment-maintenances",

  EQUIPMENT_LIST: "equipments",
  EQUIPMENT_CREATE: "equipments",
  EQUIPMENT_UPDATE: (id: string | number) => `equipments/${id}`,
  EQUIPMENT_DELETE: (id: string | number) => `equipments/${id}`,
  EQUIPMENT_GET_BY_ID: "equipments",

  // -----------------------------
  // STOCK & INVENTORY
  // -----------------------------

  FEED_USAGE_LIST: "FeedUsages",
  FEED_USAGE_CREATE: "FeedUsages",
  FEED_USAGE_UPDATE: (id: string | number) => `FeedUsages/${id}`,
  FEED_USAGE_DELETE: (id : string| number ) => `FeedUsages/${id}`,
  FEED_USAGE_GET_BY_ID: "FeedUsages",


  INVENTORY_LIST: "inventories",
  INVENTORY_CREATE: "inventories",
  GET_INVENTORY_BY_ID: "inventories",
  INVENTORY_UPDATE: (id: string | number) => `inventories/${id}`,
  INVENTORY_DELETE: (id: string | number) => `inventories/${id}`,

  SUPPLIER_LIST: "Suppliers",
  SUPPLIER_CREATE: "Suppliers",
  SUPPLIER_UPDATE: (id: string | number) => `Suppliers/${id}`,
  SUPPLIER_DELETE: (id: string | number) => `Suppliers/${id}`,
  SUPPLIER_GET_BY_ID: "Suppliers",

  FEED_PURCHASE_LIST: "FeedPurchases",
  FEED_PURCHASE_CREATE: "FeedPurchases",
  FEED_PURCHASE_UPDATE: (id: string | number) => `FeedPurchases/${id}`,
  FEED_PURCHASE_DELETE: (id: string | number) => `FeedPurchases/${id}`,
  FEED_PURCHASE_GET_BY_ID: "FeedPurchases",



  // -----------------------------
  // NOTIFICATIONS
  // -----------------------------
  NOTIFICATION_LIST: "notifications",
  NOTIFICATION_CREATE: "notifications",

  ALERT_LIST: "alerts",
  ALERT_CREATE: "alerts",
  ALERT_UPDATE: (id: string | number) => `alerts/${id}`,
  ALERTE_DELETE: (id: string | number) => `alerts/${id}`,
  ALERTE_GET_BY_ID: "alerts",


  // -----------------------------
  //Reproduction
  // -----------------------------

  GESTATIONLIST: "gestations",
  GESTATIONCREATE: "gestations",
  GESTATIONUPDATE: (id: string | number) => `gestations/${id}`,
  GESTATIONDELETE: (id: string | number) => `gestations/${id}`,
  GESTATIONGETBYID: (id: string | number) => `gestations/${id}`,

  REPRODOCTIONCYCLE_LIST: "reproduction-cycles",
  REPRODUCTIONCYCLE_CREATE: "reproduction-cycles",
  REPRODUCTIONCYCLE_UPDATE: (id: string | number) => `reproduction-cycles/${id}`,
  REPRODUCTIONCYCLE_DELETE: (id: string | number) => `reproduction-cycles/${id}`,
  REPRODUCTIONCYCLE_GET_BY_ID: (id: string | number) =>
    `reproduction-cycles/${id}`,

  PEDIGREE_LIST: "pedigrees",
  PEDIGREE_CREATE: "pedigrees",
  PEDIGREE_UPDATE: (id: string | number) => `pedigrees/${id}`,
  PEDIGREE_DELETE: (id: string | number) => `pedigrees/${id}`,
  PEDIGREE_GET_BY_ID: (id: string | number) => `pedigrees/${id}`,

  GESTATION_CHECKUPS_LIST: "gestation-checkups",
  GESTATION_CHECKUP_CREATE: "gestation-checkups",
  GESTATION_CHECKUP_UPDATE: (id: string | number) => `gestation-checkups/${id}`,
  GESTATION_CHECKUP_DELETE: (id: string | number) => `gestation-checkups/${id}`,
  GESTATION_CHECKUP_GET_BY_ID: (id: string | number) =>
    `gestation-checkups/${id}`,

  GENETIC_PERFORMANCES_LIST: "genetic-performances",
  GENETIC_PERFORMANCE_CREATE: "genetic-performances",
  GENETIC_PERFORMANCE_UPDATE: (id: string | number) => `genetic-performances/${id}`,
  GENETIC_PERFORMANCE_DELETE: (id: string | number) =>
    `genetic-performances/${id}`,
  GENETIC_PERFORMANCE_GET_BY_ID: (id: string | number) =>
    `genetic-performances/${id}`,
  GENETIC_PERFORMANCE_STATS: "genetic-performances/stats",
  GENETIC_PERFORMANCE_SYNC: (animalId: number) => `genetic-performances/${animalId}/calculate`,

  // -----------------------------


  // SALES
  // -----------------------------

  EXPENSE_UPDATE: (id: string | number) => `expenses/${id}`,
  EXPENSE_DELETE: (id: string | number) => `expenses/${id}`,
  EXPENSE_GET_BY_ID: (id: string | number) => `expenses/${id}`,
  SALE_GET_BY_ID: (id: string | number) => `sales/${id}`,
  SALE_ITEM_GET_BY_ID: (id: string | number) => `sale-items/${id}`,

  SALE_UPDATE: (id: string | number) => `sales/${id}`,
  SALE_DELETE: (id: string | number) => `sales/${id}`,
  SALE_ITEM_UPDATE: (id: string | number) => `sale-items/${id}`,
  SALE_ITEM_DELETE: (id: string | number) => `sale-items/${id}`,
  SALE_ITEM_LIST_BY_SALE: "sale-items",


  // -----------------------------

STOCK_MOVEMENT_LIST: "stock-movements",
STOCK_MOVEMENT_CREATE: "stock-movements",
STOCK_MOVEMENT_UPDATE: (id: string | number) => `stock-movements/${id}`,
STOCK_MOVEMENT_DELETE: (id: string | number) => `stock-movements/${id}`,
STOCK_MOVEMENT_GET_BY_ID: (id: string | number) => `stock-movements/${id}`,


LIST_SUBSCRIPTIONS: "subscriptions",
CREATE_SUBSCRIPTION: "subscriptions",
CANCEL_SUBCRIPTION: (id: string | number) => `subscriptions/${id}/cancel`,
UPGRADE_SUBSCRIPTION: (id: string | number) => `subscriptions/${id}`,
DELETE_SUBSCRIPTION: (id: string | number) => `subscriptions/${id}`,
GET_SUBSCRIPTION_BY_ID: "subscriptions",


LIST_PLANS: "plans",
CREATE_PLAN: "plans",
UPDATE_PLAN: (id: string | number) => `plans/${id}`,
DELETE_PLAN: (id: string | number) => `plans/${id}`,
GET_PLAN_BY_ID: "plans",

LIST_INVOICES: "invoices",
CREATE_INVOICES: "invoices",
UPDATE_INVOICES: (id: string | number) => `invoices/${id}`,
DELETE_INVOICES: (id: string | number) => `invoices/${id}`,
GET_INVOICES_BY_ID: "invoices",

LIST_PAYMENTS: "payments",
CREATE_PAYMENTS: "payments",
UPDATE_PAYMENTS: (id: string | number) => `payments/${id}`,
DELETE_PAYMENTS: (id: string | number) => `payments/${id}`,
GET_PAYMENTS_BY_ID: "payments",




};

// src/constants/routes.ts
export const SUBSCRIPTION_ROUTES = {
  BASE: "subscriptions",

  LIST_BY_ORGANIZATION: (organizationId: string | number) =>
    `subscriptions/organization/${organizationId}`,

  GET_BY_ID: (id: string | number) => `subscriptions/${id}`,

  CREATE: "subscriptions",

  UPDATE: (id: string | number) => `subscriptions/${id}`,

  CANCEL: (id: string | number) => `subscriptions/${id}/cancel`,

  DELETE: (id: string | number) => `subscriptions/${id}`,
} as const;


