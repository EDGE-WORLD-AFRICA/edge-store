import bcrypt from "bcrypt";
import { db } from "../config/dbconnection";
import { v4 as uuidv4 } from "uuid";

export interface ISetupPayload {
  meta?: any;
  license?: any;
  company?: any;
  device?: any;
  admin?: any;
  setup?: any;
}

export const setupService = {
  adminExists: async (): Promise<boolean> => {
    const result = await db("users")
      .where("is_super_admin", true)
      .first();
    return !!result;
  },

  completeSetup: async (payload: ISetupPayload) => {
    const { company, device, admin } = payload;

    // Check if admin already exists
    const existingAdmin = await db("users")
      .where("is_super_admin", true)
      .first();

    if (existingAdmin) {
      throw new Error("Super admin already exists. Setup cannot be repeated.");
    }

    // Create company
    let companyId: string;

    if (company?.company?.id) {
      companyId = company.company.id;
    } else {
      companyId = uuidv4();
      await db("companies").insert({
        id: companyId,
        name: company?.company?.name || "Edge Store",
        legal_name: company?.company?.name || "Edge Store",
        t_pin: company?.company?.tpin || null,
        business_reg_no: company?.company?.businessRegNo || null,
        logo: company?.company?.logo || null,
        business_types: JSON.stringify(company?.company?.businessTypes || []),
        source: company?.company?.source || "local",
      });
    }

    // Create branch
    let branchId: string | null = null;

    if (company?.mainBranch) {
      branchId = uuidv4();
      await db("branches").insert({
        id: branchId,
        company_id: companyId,
        code: company.mainBranch.code || "HQ-001",
        name: company.mainBranch.name || "Head Office",
        location: company.mainBranch.location || null,
        device_location: company.mainBranch.deviceLocation || null,
        is_main: company.mainBranch.isMain ?? true,
      });
    }

    // Create device
    let deviceId: string | null = null;

    if (device) {
      deviceId = uuidv4();
      await db("devices").insert({
        id: deviceId,
        company_id: companyId,
        branch_id: branchId,
        device_name: device.deviceName || "Unknown Device",
        station_number: device.stationNumber || null,
        location: device.location || null,
        machine_code: payload.meta?.machineCode || "unknown",
        status: "active",
      });
    }

    // Create admin user
    let adminId: string | null = null;

    if (admin?.username && admin?.password) {
      const passwordHash = await bcrypt.hash(admin.password, 12);
      adminId = uuidv4();

      await db("users").insert({
        id: adminId,
        company_id: companyId,
        username: admin.username,
        email: admin.email || `${admin.username}@edgestore.local`,
        name: admin.name || admin.username,
        password_hash: passwordHash,
        is_super_admin: true,
        is_active: true,
      });
    }

    return {
      companyId,
      branchId,
      deviceId,
      adminId,
      message: "Setup completed successfully",
    };
  },

  getCompanies: async () => {
    const companies = await db("companies").select("*");

    const companiesWithBranches = await Promise.all(
      companies.map(async (company: any) => {
        const branches = await db("branches")
          .where("company_id", company.id)
          .select("*");

        return {
          ...company,
          businessTypes: company.business_types ? JSON.parse(company.business_types) : [],
          branches,
        };
      })
    );

    return companiesWithBranches;
  },
};