import { useState, useEffect, ChangeEvent } from 'react';
import {
  Building2,
  ImagePlus,
  Loader2,
  Trash2,
  AlertTriangle
} from "lucide-react";
import type {
  IRemoteCompany,
  ICompanyProfile,
  IBranchProfile,
  ICompanySetupCache
} from '@edge-store/shared';
import { setCacheSection, updateCache } from '../../lib/cache';
import { fetchRemoteCompanies } from '../../lib/api';

interface ICompanySetupStepProps{
  onComplete: () => void;
}

const BUSINESS_TYPES = [
  { value: "clinic", label: "Clinic" },
  { value: "general_store", label: "General Store" },
  { value: "medical_store", label: "Medical Store" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "retail", label: "Retail" },
  { value: "supermarket", label: "Supermarket" },
  { value: "wholesale", label: "Wholesale" },
];


export const CompanySetupStep = ({ onComplete }: ICompanySetupStepProps) => {
  const [mode, setMode] = useState<"select" | "create">("select");
  const [isLoadingCompanies, setIsLoadingCompanies] = useState<boolean>(false);
  const [remoteCompanies, setRemoteCompanies] = useState<IRemoteCompany[]>([]);
  
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | number>("");
  const [selectedBranchId, setSelectedBranchId] = useState<string | number>("");

  const [companyName, setCompanyName] = useState<string>("");
  const [businessTypes, setBusinessyTypes] = useState<string[]>([]);
  const [tpin, setTpin] = useState("");
  const [businessRegNo, setBusinessRegNo] = useState("");
  const [logo, setLogo] = useState<string | undefined>(undefined);

  const [branchCode, setBranchCode] = useState("HQ-01");
  const [branchName, setBranchName] = useState("Head Office");
  const [branchLocation, setBranchLocation] = useState("");
  const [deviceLocation, setDeviceLocation] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoadingCompanies(true);
      const companies = await fetchRemoteCompanies();
      setRemoteCompanies(companies);

      if(!companies.length) setMode("create");

      setIsLoadingCompanies(false);
    };

    loadCompanies();
  }, []);

  const selectedCompany = remoteCompanies.find((company) => String(company.id) === selectedCompanyId);

  const selectedBranch = selectedCompany?.branches.find((branch) => String(branch.id) === selectedBranchId);

  const toggleBusinessType = (value: string) => {
    setBusinessyTypes((prev) => 
      prev.includes(value) 
      ? prev.filter((item) => item !== value) 
      : [...prev, value] 
    );
  };

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if(!file) return;

    if(file.size > 4 * 1024 * 1024) {
      setError("Logo must be less than 4MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setLogo(String(reader.result));
      setError(null);
    };

    reader.readAsDataURL(file);
  };

  const handleContinue = async () => {
    setError(null);
    setIsSaving(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    let company: ICompanyProfile | null = null;
    let branch: IBranchProfile | null = null;

    if(mode === "select"){
      if(!selectedCompany || !selectedBranch){
        setError("Please select both company and branch.");
        setIsSaving(false);
        return;
      }

      company = {
        id: selectedCompany.id,
        name: selectedCompany.name,
        businessTypes: selectedCompany.businessTypes,
        tpin: selectedCompany.tpin,
        businessRegNo: selectedCompany.businessRegNo,
        logo: selectedCompany.logoUrl,
        country: selectedCompany.country,
        province: selectedCompany.province,
        district: selectedCompany.district,
        source: "backend" 
      };

      branch = {
        id: selectedBranch.id,
        companyId: selectedCompany.id,
        code: selectedBranch.code,
        name: selectedBranch.name,
        location: selectedBranch.location,
        isMain: false,
        deviceLocation: deviceLocation.trim() || undefined,
      };
    }

    if (mode === "create") {
      if (!companyName.trim()) {
        setError("Company name is required.");
        setIsSaving(false);
        return;
      }

      if (!businessTypes.length) {
        setError("Select at least one business type.");
        setIsSaving(false);
        return;
      }

      if (!branchCode.trim() || !branchName.trim()) {
        setError("Branch code and branch name are required.");
        setIsSaving(false);
        return;
      }

      company = {
        name: companyName.trim(),
        businessTypes,
        tpin: tpin.trim() || undefined,
        businessRegNo: businessRegNo.trim() || undefined,
        logo,
        source: "local",
      };

      branch = {
        code: branchCode.trim(),
        name: branchName.trim(),
        location: branchLocation.trim() || undefined,
        isMain: true,
        deviceLocation: deviceLocation.trim() || undefined,
      };
    }

    const companySetup: ICompanySetupCache = {
      mode,
      company,
      mainBranch: branch,
      selectedBranchId: branch?.id,
      savedAt: new Date().toISOString(),
    };

    setCacheSection("company", companySetup);

    updateCache((cache) => {
      cache.setup.companyDetected = true;
      cache.setup.companyName = company?.name;
      cache.setup.lastBootstrapAt = new Date().toISOString();
    });

    setIsSaving(false);
    onComplete();
  };

  return(
    <>
      <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Company Details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Link an existing company from Edge World or create a new company profile.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1">
        <button
          onClick={() => setMode("select")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "select"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Link Existing
        </button>

        <button
          onClick={() => setMode("create")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "create"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Create New
        </button>
      </div>

      {mode === "select" && (
        <div className="space-y-6 rounded-lg border border-border bg-card p-6">
          {isLoadingCompanies ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 size={18} className="animate-spin" />
              Loading companies from backend...
            </div>
          ) : remoteCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <Building2 size={28} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No companies found from backend.
              </p>
              <p className="text-xs text-muted-foreground">
                You can continue with Create New.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Company
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={(e) => {
                      setSelectedCompanyId(e.target.value);
                      setSelectedBranchId("");
                    }}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select company</option>
                    {remoteCompanies.map((company) => (
                      <option key={company.id} value={String(company.id)}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Branch
                  </label>
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    disabled={!selectedCompany}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                  >
                    <option value="">Select branch</option>
                    {selectedCompany?.branches.map((branch) => (
                      <option key={branch.id} value={String(branch.id)}>
                        {branch.code} — {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedCompany && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
                      {selectedCompany.logoUrl ? (
                        <img
                          src={selectedCompany.logoUrl}
                          alt={selectedCompany.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <Building2 size={22} className="text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 space-y-2">
                      <p className="text-sm font-semibold text-foreground">
                        {selectedCompany.name}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {selectedCompany.businessTypes.map((type) => (
                          <span
                            key={type}
                            className="rounded-full bg-primary-soft px-2 py-1 text-[10px] font-medium uppercase text-primary"
                          >
                            {type.replace("_", " ")}
                          </span>
                        ))}
                      </div>

                      <div className="grid gap-1 text-xs text-muted-foreground">
                        {selectedCompany.tpin && <p>TPIN: {selectedCompany.tpin}</p>}
                        {selectedCompany.businessRegNo && (
                          <p>Reg No: {selectedCompany.businessRegNo}</p>
                        )}
                        {selectedBranch?.location && (
                          <p>Branch Location: {selectedBranch.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Device Location / Shop
                </label>
                <input
                  type="text"
                  value={deviceLocation}
                  onChange={(e) => setDeviceLocation(e.target.value)}
                  placeholder="Front Desk, Store 2, Machine 5"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </>
          )}
        </div>
      )}

      {mode === "create" && (
        <div className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-background">
              {logo ? (
                <img src={logo} alt="Company logo" className="h-full w-full object-contain" />
              ) : (
                <ImagePlus size={24} className="text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              <label className="cursor-pointer rounded-md border border-input bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-muted">
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>

              {logo && (
                <button
                  onClick={() => setLogo(undefined)}
                  className="flex items-center gap-1 text-xs text-danger hover:underline"
                >
                  <Trash2 size={12} />
                  Remove logo
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Edge Stores Supermarket"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              Business Types
            </label>

            <div className="flex flex-wrap gap-2">
              {BUSINESS_TYPES.map((type) => {
                const isActive = businessTypes.includes(type.value);

                return (
                  <button
                    key={type.value}
                    onClick={() => toggleBusinessType(type.value)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isActive
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                TPIN (Optional)
              </label>
              <input
                type="text"
                value={tpin}
                onChange={(e) => setTpin(e.target.value)}
                placeholder="TPIN-12345678"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Business Reg No. (Optional)
              </label>
              <input
                type="text"
                value={businessRegNo}
                onChange={(e) => setBusinessRegNo(e.target.value)}
                placeholder="BR-998877"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">
              Main Branch Setup
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Branch Code
                </label>
                <input
                  type="text"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">
                  Branch Location
                </label>
                <input
                  type="text"
                  value={branchLocation}
                  onChange={(e) => setBranchLocation(e.target.value)}
                  placeholder="Lilongwe Main"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">
                Device Location / Shop
              </label>
              <input
                type="text"
                value={deviceLocation}
                onChange={(e) => setDeviceLocation(e.target.value)}
                placeholder="Front Desk, Store 2, Machine 5"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-danger/10 p-3 text-sm text-danger">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={isSaving}
          className="flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary-strong disabled:opacity-50"
        >
          {isSaving && <Loader2 size={16} className="mr-2 animate-spin" />}
          {isSaving ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
    </>
  );
};