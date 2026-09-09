import bcrypt from "bcrypt";
import { db } from "../config/dbconnection";
import { v4 as uuidv4 } from "uuid";
import { saveBase64Image } from "../utils/fileStorage";

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
    const result = await db("user_accounts").where("is_super_admin", true).first();
    return !!result;
  },

  completeSetup: async (payload: ISetupPayload) => {
    const { company, device, admin } = payload;

    const existingAdmin = await db("user_accounts").where("is_super_admin", true).first();
    if (existingAdmin) {
      throw new Error("Super admin already exists. Setup cannot be repeated.");
    }

    // Handle logo upload
    let logoPath: string | null = null;
    if (company?.company?.logo && company.company.logo.startsWith("data:image")) {
      const companyId = uuidv4();
      const ext = company.company.logo.match(/^data:image\/(\w+);/)?.[1] || "png";
      const fileName = `company-${companyId}.${ext}`;
      logoPath = saveBase64Image(company.company.logo, fileName);
    }

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
        logo: logoPath,
        business_types: JSON.stringify(company?.company?.businessTypes || []),
        source: company?.company?.source || "local",
      });
    }

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

    let deviceId: string | null = null;
    if (device) {
      deviceId = uuidv4();
      await db("devices").insert({
        id: deviceId,
        company_id: companyId,
        branch_id: branchId,
        device_name: device.deviceName || "Unknown Device",
        location: device.description || null,
        machine_code: payload.meta?.machineCode || "unknown",
        status: "active",
      });
    }

    let adminId: string | null = null;
    let personId: string | null = null;

    if (admin?.username && admin?.password) {
      personId = uuidv4();
      await db("person").insert({
        id: personId,
        first_name: admin.firstName || admin.username,
        other_names: admin.otherNames || null,
        last_name: admin.lastName || admin.firstName || admin.username,
      });

      const passwordHash = await bcrypt.hash(admin.password, 12);
      adminId = uuidv4();

      await db("user_accounts").insert({
        id: adminId,
        person_id: personId,
        company_id: companyId,
        username: admin.username,
        password_hash: passwordHash,
        is_super_admin: true,
        is_active: true,
      });

      const superAdminRole = await db("roles").where("name", "Super Admin").first();
      if (superAdminRole) {
        await db("user_roles").insert({
          id: uuidv4(),
          user_id: adminId,
          role_id: superAdminRole.id,
        });
      }
    }

    return {
      companyId,
      branchId,
      deviceId,
      adminId,
      personId,
      logoUrl: logoPath,
      message: "Setup completed successfully",
    };
  },

  getCompanies: async () => {
    const companies = await db("companies").select("*");

    const companiesWithBranches = await Promise.all(
      companies.map(async (company) => {
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