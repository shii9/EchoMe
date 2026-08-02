import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Key, Eye, EyeOff, Trash2, Plus, Save, X, ExternalLink,
  Shield, Zap, Lock, CheckCircle2, AlertTriangle, Info, Globe
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface APIKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  service: string;
  isVisible: boolean;
}

interface APIService {
  id: string;
  name: string;
  description: string;
  rateLimit: string;
  envVar: string;
  icon: React.ReactNode;
  color: string;
  getKeyUrl?: string;
}

// ─── Services ─────────────────────────────────────────────────────────────────
const apiServices: APIService[] = [
  {
    id: 'virustotal',
    name: 'VirusTotal',
    description: 'URL reputation checking and malware detection powered by 70+ antivirus engines.',
    rateLimit: '500 req / min',
    envVar: 'VITE_VIRUSTOTAL_API_KEY',
    icon: <Shield className="w-5 h-5" />,
    color: 'from-primary/20 to-primary/10 text-primary',
    getKeyUrl: 'https://www.virustotal.com/gui/join-us'
  },
  {
    id: 'safebrowsing',
    name: 'Google Safe Browsing',
    description: 'Real-time malicious URL detection backed by Google\'s threat intelligence.',
    rateLimit: '1,000 req / day',
    envVar: 'VITE_GOOGLE_SAFEBROWSING_API_KEY',
    icon: <Globe className="w-5 h-5" />,
    color: 'from-green-500/20 to-green-600/10 text-green-500',
    getKeyUrl: 'https://console.cloud.google.com/apis/credentials'
  },
  {
    id: 'phishtank',
    name: 'PhishTank',
    description: 'Community-driven phishing URL database with crowd-verified submissions.',
    rateLimit: '10,000 req / day',
    envVar: 'VITE_PHISHTANK_API_KEY',
    icon: <AlertTriangle className="w-5 h-5" />,
    color: 'from-amber-500/20 to-amber-600/10 text-amber-500',
    getKeyUrl: 'https://phishtank.com/developer_info.php'
  },
  {
    id: 'urlscan',
    name: 'URLScan.io',
    description: 'Deep URL analysis with visual screenshots, DOM inspection, and network activity.',
    rateLimit: '100 req / day',
    envVar: 'VITE_URLSCAN_API_KEY',
    icon: <Zap className="w-5 h-5" />,
    color: 'from-accent/20 to-accent/10 text-accent',
    getKeyUrl: 'https://urlscan.io/user/signup'
  }
];

// ─── Component ────────────────────────────────────────────────────────────────
export const APIKeysModal: React.FC<APIKeysModalProps> = ({ isOpen, onClose }) => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState('');
  const [newKeyService, setNewKeyService] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [serviceInputs, setServiceInputs] = useState<Record<string, string>>({});
  const [visibleInputs, setVisibleInputs] = useState<Record<string, boolean>>({});

  // ── Helpers ──
  // API keys must never be persisted in browser storage. Keep this session-only
  // until each integration is moved behind an authenticated server endpoint.
  const persist = (_keys: APIKey[]) => undefined;

  const addAPIKey = () => {
    if (!newKeyName.trim() || !newKeyValue.trim() || !newKeyService.trim()) {
      toast.error('Please fill in all fields'); return;
    }
    const newKey: APIKey = { id: Date.now().toString(), name: newKeyName.trim(), key: newKeyValue.trim(), service: newKeyService.trim(), isVisible: false };
    const updated = [...apiKeys, newKey];
    setApiKeys(updated); persist(updated);
    setNewKeyName(''); setNewKeyValue(''); setNewKeyService('');
    setShowAddForm(false);
    toast.success('API key added');
  };

  const saveServiceKey = (serviceName: string) => {
    const keyValue = serviceInputs[serviceName];
    if (!keyValue?.trim()) { toast.error('Please enter an API key'); return; }
    const idx = apiKeys.findIndex(k => k.service === serviceName);
    const newKey: APIKey = { id: idx >= 0 ? apiKeys[idx].id : Date.now().toString(), name: `${serviceName} API`, key: keyValue.trim(), service: serviceName, isVisible: false };
    const updated = idx >= 0 ? apiKeys.map((k, i) => i === idx ? newKey : k) : [...apiKeys, newKey];
    setApiKeys(updated); persist(updated);
    setServiceInputs(s => ({ ...s, [serviceName]: '' }));
    toast.success(`${serviceName} key saved`);
  };

  const deleteServiceKey = (serviceName: string) => {
    const updated = apiKeys.filter(k => k.service !== serviceName);
    setApiKeys(updated); persist(updated);
    toast.success(`${serviceName} key removed`);
  };

  const deleteAPIKey = (id: string) => {
    const updated = apiKeys.filter(k => k.id !== id);
    setApiKeys(updated); persist(updated);
    toast.success('Key deleted');
  };

  const toggleKeyVisibility = (id: string) => setApiKeys(apiKeys.map(k => k.id === id ? { ...k, isVisible: !k.isVisible } : k));
  const toggleInputVisibility = (name: string) => setVisibleInputs(v => ({ ...v, [name]: !v[name] }));

  const getServiceKey = (name: string) => apiKeys.find(k => k.service === name);
  const customKeys = apiKeys.filter(k => !apiServices.some(s => s.name === k.service));
  const configuredCount = apiServices.filter(s => getServiceKey(s.name)).length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm overflow-y-auto no-scrollbar"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl mx-4 my-8"
          >
            <Card className="overflow-hidden bg-card border-border/50 shadow-2xl">

              {/* ══════════════════════════ HEADER ══════════════════════════ */}
              <div className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border/40 px-8 py-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shadow-inner border border-primary/20">
                    <Key className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-foreground tracking-tight">API Key Manager</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Session-only integration settings; production API keys belong on the server
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-sm font-semibold px-3 py-1.5 ${configuredCount > 0
                      ? 'border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400'
                      : 'border-border text-muted-foreground'}`}
                  >
                    {configuredCount}/{apiServices.length} Active
                  </Badge>
                  <button
                    onClick={onClose}
                    className="x-close-btn x-close-btn-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ══════════════════════════ BODY ══════════════════════════ */}
              <div className="p-8 space-y-8 max-h-[calc(85vh-100px)] overflow-y-auto">

                {/* ── How It Works ── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/40 p-6"
                >
                  <div className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
                      className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5"
                    >
                      <Info className="w-5 h-5 text-primary" />
                    </motion.div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-foreground mb-2">How It Works</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        API keys entered here are held in memory only and are cleared when the page is
                        refreshed. They are not persisted and should not be used for production secrets.
                        Configure threat-intelligence providers through authenticated server-side endpoints
                        with secret storage and rate limiting before enabling live enrichment.
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* ── Service Cards ── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h3 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Threat Intelligence Services
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {apiServices.map((service) => {
                      const existingKey = getServiceKey(service.name);
                      const inputVal = serviceInputs[service.name] || '';
                      const inputVisible = visibleInputs[service.name];

                      return (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 16, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.35, delay: 0.2 + apiServices.indexOf(service) * 0.07, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.12)' }}
                          className={`relative rounded-2xl border p-5 transition-colors cursor-default ${existingKey
                            ? 'border-green-500/30 bg-green-500/[0.03] shadow-sm shadow-green-500/5'
                            : 'border-border/50 bg-card'}`}
                        >
                          {/* Status dot */}
                          <div className={`absolute top-4 right-4 w-2.5 h-2.5 rounded-full ${existingKey ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-muted-foreground/20'}`} />

                          {/* Icon + name */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center`}>
                              {service.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground">{service.name}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal mt-0.5">
                                {service.rateLimit}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{service.description}</p>

                          {existingKey ? (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">Key configured</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteServiceKey(service.name)}
                                className="h-7 px-2 text-xs text-destructive/70 hover:text-destructive hover:bg-destructive/10 gap-1"
                              >
                                <Trash2 className="w-3 h-3" /> Remove
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Input
                                    type={inputVisible ? 'text' : 'password'}
                                    placeholder="Paste your API key here..."
                                    value={inputVal}
                                    onChange={(e) => setServiceInputs({ ...serviceInputs, [service.name]: e.target.value })}
                                    className="h-9 text-xs pr-9 font-mono bg-muted/30 border-border/50 rounded-xl [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden"
                                    onKeyDown={(e) => { if (e.key === 'Enter') saveServiceKey(service.name); }}
                                    autoComplete="off"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => toggleInputVisibility(service.name)}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                                  >
                                    {inputVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                  </button>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={() => saveServiceKey(service.name)}
                                  disabled={!inputVal.trim()}
                                  className="h-9 px-4 text-xs gap-1.5 rounded-xl"
                                >
                                  <Save className="w-3 h-3" /> Save
                                </Button>
                              </div>
                              {service.getKeyUrl && (
                                <button
                                  onClick={() => window.open(service.getKeyUrl, '_blank')}
                                  className="flex items-center gap-1.5 text-[11px] text-primary/70 hover:text-primary transition-colors"
                                >
                                  <ExternalLink className="w-3 h-3" /> Get a free API key →
                                </button>
                              )}
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* ── Custom Keys ── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      Custom API Keys
                      {customKeys.length > 0 && (
                        <Badge variant="secondary" className="text-xs h-5 px-2">{customKeys.length}</Badge>
                      )}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddForm(v => !v)}
                      className="h-8 px-3 text-xs gap-1.5 rounded-xl"
                    >
                      {showAddForm ? <><X className="w-3 h-3" /> Cancel</> : <><Plus className="w-3 h-3" /> Add Key</>}
                    </Button>
                  </div>

                  <AnimatePresence>
                    {showAddForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden mb-4"
                      >
                        <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-5 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <Label className="text-xs font-medium mb-1.5 block">Key Name</Label>
                              <Input placeholder="e.g., OpenAI API" value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="h-9 text-sm rounded-xl" />
                            </div>
                            <div>
                              <Label className="text-xs font-medium mb-1.5 block">Service</Label>
                              <Input placeholder="e.g., OpenAI" value={newKeyService} onChange={(e) => setNewKeyService(e.target.value)} className="h-9 text-sm rounded-xl" />
                            </div>
                            <div>
                              <Label className="text-xs font-medium mb-1.5 block">API Key</Label>
                              <Input type="password" placeholder="sk-..." value={newKeyValue} onChange={(e) => setNewKeyValue(e.target.value)} className="h-9 text-sm font-mono rounded-xl [&::-ms-reveal]:hidden [&::-ms-clear]:hidden [&::-webkit-credentials-auto-fill-button]:hidden" autoComplete="off" />
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button size="sm" onClick={addAPIKey} className="h-8 px-4 text-xs gap-1.5 rounded-xl">
                              <Save className="w-3 h-3" /> Add Key
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {customKeys.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customKeys.map((apiKey, idx) => (
                        <motion.div
                          key={apiKey.id}
                          initial={{ opacity: 0, y: 16, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.35, delay: idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.12)' }}
                          className="relative rounded-2xl border border-green-500/30 bg-green-500/[0.03] shadow-sm shadow-green-500/5 p-5 cursor-default"
                        >
                          {/* Status dot */}
                          <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-500/50" />

                          {/* Icon + name */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary flex items-center justify-center">
                              <Key className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground truncate">{apiKey.name}</span>
                              </div>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 font-normal mt-0.5">
                                {apiKey.service}
                              </Badge>
                            </div>
                          </div>

                          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                            Custom API integration for {apiKey.service}. Key is securely stored in your browser and used for local analysis.
                          </p>

                          {/* Configured state */}
                          <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/15">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <code className="text-xs text-muted-foreground font-mono truncate">
                                {apiKey.isVisible ? apiKey.key : `${apiKey.key.substring(0, 6)}••••••${apiKey.key.slice(-4)}`}
                              </code>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              <Button variant="ghost" size="sm" onClick={() => toggleKeyVisibility(apiKey.id)} className="h-7 w-7 p-0 rounded-full">
                                {apiKey.isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => deleteAPIKey(apiKey.id)} className="h-7 w-7 p-0 rounded-full text-destructive/70 hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    !showAddForm && (
                      <div className="text-center py-8 rounded-2xl border border-dashed border-border/40 bg-muted/10">
                        <Key className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2.5" />
                        <p className="text-sm text-muted-foreground">No custom keys added</p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">Click "Add Key" to store a custom API key</p>
                      </div>
                    )
                  )}
                </motion.div>

                {/* ── Security Notice ── */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15"
                >
                  <Shield className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">Security Notice</h4>
                    <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                      API keys are kept in memory only and are never persisted by this client. Configure production integrations on the server with secret storage, authentication, and rate limiting.
                    </p>
                  </div>
                </motion.div>

              </div>

              {/* ══════════════════════════ FOOTER ══════════════════════════ */}
              <div className="border-t border-border/40 px-8 py-4 bg-muted/10 flex justify-end">
                <Button variant="outline" onClick={onClose} className="h-9 px-5 text-sm rounded-xl">
                  Done
                </Button>
              </div>

            </Card>
          </motion.div>
        </motion.div>
      )
      }
    </AnimatePresence >
  );
};

export default APIKeysModal;
