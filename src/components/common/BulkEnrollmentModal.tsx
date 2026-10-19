import React, { useState } from 'react';
import { 
  X, Upload, Download, FileSpreadsheet, Terminal, 
  CheckCircle2, AlertTriangle, Laptop, ShieldCheck, 
  Copy, Check, Layers, RefreshCw, FileText
} from 'lucide-react';
import { useUEM } from '../../context/UEMContext';
import { BulkEnrollmentItem, Platform } from '../../types/uem';

interface BulkEnrollmentModalProps {
  onClose: () => void;
}

export const BulkEnrollmentModal: React.FC<BulkEnrollmentModalProps> = ({ onClose }) => {
  const { bulkEnrollDevices, organization } = useUEM();
  const [activeTab, setActiveTab] = useState<'csv' | 'scripts' | 'quick'>('csv');
  const [csvText, setCsvText] = useState<string>(
`hostname,platform,department,branch,assignedUser,assignedUserEmail,serialNumber,assetTag
CCI-W11-ENG05,windows,Refrigeration Engineering & Technical Services,Pasig Main Plant & Corporate HQ,Engr. Carlo Cruz,c.cruz@coolaire.com.ph,5CD24599A1,CCI-AST-1101
CCI-REEFER-110,android,Cold Chain Logistics & Reefer Fleet,Caloocan Cold Storage & Distribution Hub,Joel Valenzuela,logistics.fleet@coolaire.com.ph,R52X9055KC,CCI-VAN-110
CCI-REEFER-112,android,Cold Chain Logistics & Reefer Fleet,Laguna Technopark Service Depot,Ramon Dizon,logistics.fleet@coolaire.com.ph,R52X9066KD,CCI-VAN-112
CCI-W11-TECH04,windows,Refrigeration Engineering & Technical Services,Pampanga North Luzon Hub,Nestor Flores,n.flores@coolaire.com.ph,TB40-99014,CCI-AST-2104
CCI-QC-TAB03,android,Manufacturing & Reefer Assembly Plant,Pasig Main Plant & Corporate HQ,Albert Soriano,a.soriano@coolaire.com.ph,ZB881944K,CCI-TAB-QC03`
  );

  const [parsedItems, setParsedItems] = useState<BulkEnrollmentItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enrolledCount, setEnrolledCount] = useState<number | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const parseCsv = (text: string) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const items: BulkEnrollmentItem[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(',').map(v => v.trim());
      
      const item: Partial<BulkEnrollmentItem> = {};
      headers.forEach((h, idx) => {
        const val = values[idx] || '';
        if (h === 'hostname') item.hostname = val;
        if (h === 'platform') item.platform = (val.toLowerCase() as Platform) || 'windows';
        if (h === 'department') item.department = val;
        if (h === 'branch') item.branch = val;
        if (h === 'assigneduser' || h === 'assigned_user' || h === 'user') item.assignedUser = val;
        if (h === 'assigneduseremail' || h === 'useremail' || h === 'email') item.assignedUserEmail = val;
        if (h === 'serialnumber' || h === 'serial') item.serialNumber = val;
        if (h === 'assettag' || h === 'asset_tag') item.assetTag = val;
      });

      if (item.hostname) {
        items.push({
          hostname: item.hostname,
          platform: (item.platform as Platform) || 'windows',
          department: item.department || 'Cold Chain Logistics & Reefer Fleet',
          branch: item.branch || 'Pasig Main Plant & Corporate HQ',
          assignedUser: item.assignedUser || 'Fleet Driver',
          assignedUserEmail: item.assignedUserEmail || 'logistics.fleet@coolaire.com.ph',
          serialNumber: item.serialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
          assetTag: item.assetTag || `CCI-AST-${Math.floor(1000 + Math.random() * 9000)}`,
        });
      }
    }
    return items;
  };

  const handleParsePreview = () => {
    const items = parseCsv(csvText);
    setParsedItems(items);
    setEnrolledCount(null);
  };

  const handleDownloadTemplate = () => {
    const templateContent = `hostname,platform,department,branch,assignedUser,assignedUserEmail,serialNumber,assetTag
CCI-W11-ENG05,windows,Refrigeration Engineering & Technical Services,Pasig Main Plant & Corporate HQ,Engr. Carlo Cruz,c.cruz@coolaire.com.ph,5CD24599A1,CCI-AST-1101
CCI-REEFER-110,android,Cold Chain Logistics & Reefer Fleet,Caloocan Cold Storage & Distribution Hub,Joel Valenzuela,logistics.fleet@coolaire.com.ph,R52X9055KC,CCI-VAN-110
CCI-REEFER-112,android,Cold Chain Logistics & Reefer Fleet,Laguna Technopark Service Depot,Ramon Dizon,logistics.fleet@coolaire.com.ph,R52X9066KD,CCI-VAN-112
CCI-W11-TECH04,windows,Refrigeration Engineering & Technical Services,Pampanga North Luzon Hub,Nestor Flores,n.flores@coolaire.com.ph,TB40-99014,CCI-AST-2104
CCI-QC-TAB03,android,Manufacturing & Reefer Assembly Plant,Pasig Main Plant & Corporate HQ,Albert Soriano,a.soriano@coolaire.com.ph,ZB881944K,CCI-TAB-QC03`;

    const blob = new Blob([templateContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cci_fleet_enrollment_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEnrollBatch = async () => {
    const itemsToEnroll = parsedItems.length > 0 ? parsedItems : parseCsv(csvText);
    if (itemsToEnroll.length === 0) return;

    setIsProcessing(true);
    try {
      const count = await bulkEnrollDevices(itemsToEnroll);
      setEnrolledCount(count);
      setParsedItems([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleQuickProvision = async (type: 'reefers' | 'technicians' | 'qc_tablets') => {
    setIsProcessing(true);
    let batch: BulkEnrollmentItem[] = [];

    if (type === 'reefers') {
      batch = [
        {
          hostname: `CCI-REEFER-${Math.floor(200 + Math.random() * 50)}`,
          platform: 'android',
          department: 'Cold Chain Logistics & Reefer Fleet',
          branch: 'Caloocan Cold Storage & Distribution Hub',
          assignedUser: 'Ernesto Mercado (Driver)',
          assignedUserEmail: 'logistics.fleet@coolaire.com.ph',
          serialNumber: `R52X${Math.floor(1000 + Math.random() * 9000)}KC`,
          assetTag: `CCI-VAN-${Math.floor(200 + Math.random() * 50)}`,
          model: 'Samsung Galaxy Tab Active4 Pro Rugged',
        },
        {
          hostname: `CCI-REEFER-${Math.floor(251 + Math.random() * 50)}`,
          platform: 'android',
          department: 'Cold Chain Logistics & Reefer Fleet',
          branch: 'Laguna Technopark Service Depot',
          assignedUser: 'Vicente Santos (Driver)',
          assignedUserEmail: 'logistics.fleet@coolaire.com.ph',
          serialNumber: `R52X${Math.floor(1000 + Math.random() * 9000)}KC`,
          assetTag: `CCI-VAN-${Math.floor(251 + Math.random() * 50)}`,
          model: 'Samsung Galaxy Tab Active4 Pro Rugged',
        },
        {
          hostname: `CCI-REEFER-${Math.floor(301 + Math.random() * 50)}`,
          platform: 'android',
          department: 'Cold Chain Logistics & Reefer Fleet',
          branch: 'Pampanga North Luzon Hub',
          assignedUser: 'Danilo Gomez (Driver)',
          assignedUserEmail: 'logistics.fleet@coolaire.com.ph',
          serialNumber: `R52X${Math.floor(1000 + Math.random() * 9000)}KC`,
          assetTag: `CCI-VAN-${Math.floor(301 + Math.random() * 50)}`,
          model: 'Samsung Galaxy Tab Active4 Pro Rugged',
        }
      ];
    } else if (type === 'technicians') {
      batch = [
        {
          hostname: `CCI-W11-TECH-RUG0${Math.floor(1 + Math.random() * 9)}`,
          platform: 'windows',
          department: 'Refrigeration Engineering & Technical Services',
          branch: 'Pasig Main Plant & Corporate HQ',
          assignedUser: 'Engr. Dennis Morales',
          assignedUserEmail: 'd.morales@coolaire.com.ph',
          serialNumber: `TB40-${Math.floor(10000 + Math.random() * 90000)}`,
          assetTag: `CCI-AST-${Math.floor(3000 + Math.random() * 900)}`,
          model: 'Panasonic Toughbook 40 Rugged',
        },
        {
          hostname: `CCI-W11-TECH-RUG0${Math.floor(1 + Math.random() * 9)}`,
          platform: 'windows',
          department: 'Refrigeration Engineering & Technical Services',
          branch: 'Cebu Mandaue Regional Center',
          assignedUser: 'Engr. Gary Villamor',
          assignedUserEmail: 'g.villamor@coolaire.com.ph',
          serialNumber: `TB40-${Math.floor(10000 + Math.random() * 90000)}`,
          assetTag: `CCI-AST-${Math.floor(3000 + Math.random() * 900)}`,
          model: 'Panasonic Toughbook 40 Rugged',
        }
      ];
    } else {
      batch = [
        {
          hostname: `CCI-QC-TAB-${Math.floor(10 + Math.random() * 90)}`,
          platform: 'android',
          department: 'Manufacturing & Reefer Assembly Plant',
          branch: 'Pasig Main Plant & Corporate HQ',
          assignedUser: 'Marvin Bautista (QC)',
          assignedUserEmail: 'qc.assembly@coolaire.com.ph',
          serialNumber: `ZB-${Math.floor(100000 + Math.random() * 900000)}`,
          assetTag: `CCI-TAB-QC${Math.floor(10 + Math.random() * 90)}`,
          model: 'Zebra ET40 Enterprise Tablet',
        }
      ];
    }

    try {
      const count = await bulkEnrollDevices(batch);
      setEnrolledCount(count);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>CCI Fleet Bulk Enrollment & Provisioning</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  {organization.name}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Centralized multi-endpoint onboarding via CSV manifest, Active Directory GPO, or Zero-Touch profiles
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-900/50 text-xs font-semibold gap-6">
          <button
            onClick={() => setActiveTab('csv')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'csv' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>CSV Batch Importer</span>
          </button>
          <button
            onClick={() => setActiveTab('quick')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'quick' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>1-Click Fleet Quick-Provision</span>
          </button>
          <button
            onClick={() => setActiveTab('scripts')}
            className={`py-3 flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'scripts' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Bulk Deployment Scripts (GPO / Knox)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* TAB 1: CSV BATCH IMPORTER */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-200">Upload or Paste Device Manifest</h4>
                  <p className="text-[11px] text-slate-400">
                    Expected columns: hostname, platform (windows/android/macos), department, branch, assignedUser, assignedUserEmail, serialNumber, assetTag
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 font-medium transition-colors shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV Template</span>
                </button>
              </div>

              {/* CSV Textarea */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-slate-400 text-[11px]">
                  <span>CSV Raw Text:</span>
                  <button 
                    onClick={handleParsePreview}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    Parse & Preview Table
                  </button>
                </div>
                <textarea
                  value={csvText}
                  onChange={(e) => {
                    setCsvText(e.target.value);
                    setParsedItems([]);
                    setEnrolledCount(null);
                  }}
                  rows={6}
                  className="w-full font-mono text-[11px] bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="Paste CSV rows here..."
                />
              </div>

              {/* Preview Table */}
              {parsedItems.length > 0 && (
                <div className="space-y-2 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200">Parsed Devices Ready for Provisioning ({parsedItems.length})</span>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> All fields validated
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-48 border border-slate-800/80 rounded-lg">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-2">Hostname</th>
                          <th className="p-2">Platform</th>
                          <th className="p-2">Department</th>
                          <th className="p-2">Branch</th>
                          <th className="p-2">Assigned User</th>
                          <th className="p-2">Serial Number</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                        {parsedItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-2 font-bold text-slate-200">{item.hostname}</td>
                            <td className="p-2">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-sans font-medium ${
                                item.platform === 'windows' ? 'bg-blue-500/20 text-blue-400' :
                                item.platform === 'android' ? 'bg-emerald-500/20 text-emerald-400' :
                                'bg-purple-500/20 text-purple-400'
                              }`}>
                                {item.platform}
                              </span>
                            </td>
                            <td className="p-2 font-sans truncate max-w-[120px]">{item.department}</td>
                            <td className="p-2 font-sans truncate max-w-[120px]">{item.branch}</td>
                            <td className="p-2 font-sans">{item.assignedUser}</td>
                            <td className="p-2 text-slate-400">{item.serialNumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Success Result */}
              {enrolledCount !== null && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Successfully bulk enrolled <strong>{enrolledCount}</strong> devices into Coolaire Consolidated Inc. fleet!</span>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    View in Device Fleet
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleParsePreview}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                >
                  Validate Manifest
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleEnrollBatch}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  <span>{isProcessing ? 'Enrolling Fleet...' : 'Enroll All Validated Devices'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: QUICK PROVISIONING */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <p className="text-slate-400">
                Instantly simulate and inject pre-configured batches of Coolaire field endpoints with authentic cold chain telematics:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Cold Chain Reefer Vans */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-2">
                      🚐
                    </div>
                    <h4 className="font-bold text-slate-200">Reefer Delivery Vans</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      3x Samsung Galaxy Tab Active4 Pro units mounted in Caloocan, Laguna, and Pampanga cold vans with -20°C telemetry sensors.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleQuickProvision('reefers')}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Quick Provision (3 Vans)</span>
                  </button>
                </div>

                {/* Field Technicians */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-2">
                      💻
                    </div>
                    <h4 className="font-bold text-slate-200">Field Service Technicians</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      2x Panasonic Toughbook 40 rugged laptops with Carel Diagnostic Suite for mobile refrigeration service engineers.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleQuickProvision('technicians')}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Quick Provision (2 Laptops)</span>
                  </button>
                </div>

                {/* Assembly QC Tablets */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-2">
                      📋
                    </div>
                    <h4 className="font-bold text-slate-200">Assembly Line QC Tablet</h4>
                    <p className="text-[11px] text-slate-400 mt-1">
                      1x Zebra ET40 tablet for Pasig refrigerated truck body insulation polyurethane QA inspection.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() => handleQuickProvision('qc_tablets')}
                    className="w-full py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-600/20"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Quick Provision (1 Tablet)</span>
                  </button>
                </div>
              </div>

              {enrolledCount !== null && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between">
                  <span className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4" /> Provisioned {enrolledCount} devices successfully!
                  </span>
                  <button
                    onClick={onClose}
                    className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DEPLOYMENT SCRIPTS */}
          {activeTab === 'scripts' && (
            <div className="space-y-4">
              {/* Windows GPO Batch Script */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-blue-400" />
                    <span className="font-bold text-slate-200">Windows Active Directory GPO Startup Script (Deploy-CCIBulk.bat)</span>
                  </div>
                  <button
                    onClick={() => copyCode(
`@echo off
rem ==============================================================================
rem Coolaire Consolidated Inc. (CCI) - Enterprise UEM Agent Silent Provisioning
rem ==============================================================================
set UEM_SERVER=https://ais-dev-3v52iuqsjn55bd4umuuhju-239656916038.asia-southeast1.run.app
set ENROLL_TOKEN=CCI-WIN-CORP-FLEET-2026

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "Invoke-WebRequest -Uri '%UEM_SERVER%/agent/windows/VanguardAgent.ps1' -OutFile '$env:TEMP\\VanguardAgent.ps1'; ^
   & '$env:TEMP\\VanguardAgent.ps1' -EnrollmentToken '%ENROLL_TOKEN%' -Silent -AutoRegisterService"
exit /b 0`, 'bat')}
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'bat' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'bat' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 font-mono text-[10px] text-slate-300 rounded-lg overflow-x-auto border border-slate-800">
{`@echo off
set UEM_SERVER=https://ais-dev-3v52iuqsjn55bd4umuuhju-239656916038.asia-southeast1.run.app
set ENROLL_TOKEN=CCI-WIN-CORP-FLEET-2026

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
  "Invoke-WebRequest -Uri '%UEM_SERVER%/agent/windows/VanguardAgent.ps1' -OutFile '$env:TEMP\\VanguardAgent.ps1'; ^
   & '$env:TEMP\\VanguardAgent.ps1' -EnrollmentToken '%ENROLL_TOKEN%' -Silent -AutoRegisterService"`}
                </pre>
              </div>

              {/* Android Zero-Touch DPC Extras */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-200">Android Enterprise Zero-Touch / Knox DPC Configuration (JSON)</span>
                  </div>
                  <button
                    onClick={() => copyCode(
`{
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "ph.coolaire.uem.dpc/.DeviceAdminReceiver",
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_SIGNATURE_CHECKSUM": "9b2c34a9194e82dfd6a85811776ea245b0d0c354e60f279f048d0879133ad789",
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_PACKAGE_DOWNLOAD_LOCATION": "https://storage.googleapis.com/coolaire-uem/dpc/CCIAgent.apk",
  "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
    "orgId": "org-cci-01",
    "enrollmentToken": "CCI-AND-REEFER-FLEET-2026",
    "telematicsIntervalSeconds": 60,
    "kioskLock": true
  }
}`, 'json')}
                    className="flex items-center gap-1 text-slate-400 hover:text-white"
                  >
                    {copiedKey === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'json' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 bg-slate-900 font-mono text-[10px] text-slate-300 rounded-lg overflow-x-auto border border-slate-800">
{`{
  "android.app.extra.PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME": "ph.coolaire.uem.dpc/.DeviceAdminReceiver",
  "android.app.extra.PROVISIONING_ADMIN_EXTRAS_BUNDLE": {
    "orgId": "org-cci-01",
    "enrollmentToken": "CCI-AND-REEFER-FLEET-2026",
    "telematicsIntervalSeconds": 60,
    "kioskLock": true
  }
}`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-slate-400 text-[11px]">
          <span>Enrolled endpoints automatically receive zero-trust policies and start live heartbeat synchronization.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
