import React, { useState, useEffect } from 'react';
import {Icon, Square, Download, ChevronDown, Loader2, Grid2x2, Apple, Moon, Sun} from 'lucide-react';
import { penguin } from '@lucide/lab';

const DownloadButtons = () => {
    const [detectedOS, setDetectedOS] = useState('windows');
    const [detectedArch, setDetectedArch] = useState('x86');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [releases, setReleases] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [buildType, setBuildType] = useState('stable'); // 'stable' or 'nightly'
    const [hoveredDropdown, setHoveredDropdown] = useState(null);
    const [dropdownMaxHeight, setDropdownMaxHeight] = useState(400);

    useEffect(() => {
        // Detect OS
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (userAgent.includes('mac')) setDetectedOS('macos');
        else if (userAgent.includes('linux')) setDetectedOS('linux');
        else if (userAgent.includes('win')) setDetectedOS('windows');

        // Detect architecture
        if (userAgent.includes('arm') || userAgent.includes('aarch64')) {
            setDetectedArch('arm');
        }

        // Fetch latest release from GitHub
        fetchLatestRelease();
    }, [buildType]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && !event.target.closest('[data-dropdown-container]')) {
                setOpenDropdown(null);
            }
        };

        if (openDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [openDropdown]);

    const fetchLatestRelease = async () => {
        setLoading(true);
        try {
            const tag = buildType === 'nightly' ? 'tags/nightly' : 'latest';
            const response = await fetch(`https://api.github.com/repos/WerWolv/ImHex/releases/${tag}`, {
                headers: {
                    'Accept': 'application/vnd.github+json',
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            setReleases(data);
            setLoading(false);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
            setLoading(false);
        }
    };

    const getFriendlyName = (filename) => {
        const name = filename.toLowerCase();
        const isNoGPU = name.includes('nogpu');
        const isX86 = name.includes('x86_64');
        const isARM = name.includes('arm64');

        let prefix = "";
        let installType = "";
        let suffix = "";

        if (isX86) suffix = "x86_64";
        else if (isARM) suffix = "ARM64";

        // Windows
        if (name.includes('windows') || name.includes('win')) {
            prefix = "Windows";
            if (name.endsWith(".msi")) installType = "MSI Installer";
            else if (name.endsWith(".zip")) installType = "Portable"
        }
        
        // macOS
        if (name.includes('macos') || name.includes('darwin')) {
            if (isARM) prefix = "Apple Silicon";
            else if (isX86) prefix = "Intel CPU";

            installType = "DMG"
            suffix = "";
        }
        
        // Ubuntu
        if (name.includes('ubuntu')) {
            const versionMatch = name.match(/ubuntu[_-]?(\d+\.\d+)/);
            const version = versionMatch ? versionMatch[1] : '';
            prefix = `Ubuntu ${version}`;
            installType = "DEB Package"
        }
        
        // Debian
        if (name.includes('debian')) {
            const versionMatch = name.match(/debian[_-]?(\d+)/);
            const version = versionMatch ? versionMatch[1] : '';
            prefix = `Debian ${version}`;
            installType = "DEB Package"
        }
        
        // Fedora
        if (name.includes('fedora')) {
            const versionMatch = name.match(/fedora[_-]?(\d+)/);
            const version = versionMatch ? versionMatch[1] : '';
            prefix = `Fedora ${version}`;
            installType = "RPM Package"
        }
        
        // RHEL
        if (name.includes('rhel')) {
            const versionMatch = name.match(/rhel[_-]?(\d+)/);
            const version = versionMatch ? versionMatch[1] : '';
            prefix = `RHEL ${version}`;
            installType = "RPM Package"
        }
        
        // Arch
        if (name.includes('arch')) {
            prefix = "Arch Linux";
            installType = "Package"
        }

        // AppImage
        if (name.endsWith('.appimage')) {
            prefix = "AppImage";
        }

        // Flatpak
        if (name.endsWith('.flatpak')) {
            prefix = "Flatpak";
        }

        // Snap
        if (name.endsWith('.snap')) {
            prefix = "Snap";
        }

        let result = prefix;
        if (suffix !== "")
            result += ` ${suffix}`;
        if (installType !== "")
            result += ` ${installType}`;
        if (isNoGPU)
            result += ` (SW Rendered)`;
        
        return result;
    };

    const categorizeAssets = () => {
        if (!releases || !releases.assets) return { windows: {}, macos: [], linux: {} };

        const categorized = {
            windows: { x64: [], arm64: [] },
            macos: [],
            linux: []
        };

        categorized.linux["Everywhere"] = []

        releases.assets.forEach(asset => {
            const name = asset.name.toLowerCase();
            const friendlyName = getFriendlyName(asset.name);
            
            const assetData = {
                name: asset.name,
                friendlyName: friendlyName,
                url: asset.browser_download_url,
                size: (asset.size / 1024 / 1024).toFixed(1) + ' MB',
                isMSI: name.endsWith('.msi'),
                isPortable: !name.endsWith('.msi') && !name.endsWith('.dmg'),
                isNoGPU: name.includes('nogpu'),
                isArm: name.includes('arm64'),
            };

            // Windows detection
            if (name.includes('windows')) {
                const arch = name.includes('arm64') ? 'arm64' : 'x64';
                categorized.windows[arch].push(assetData);
            }
            // macOS detection
            else if (name.includes('macos')) {
                categorized.macos.push(assetData);
            }
            // Linux detection - exclude source archives
            else if (!name.includes('sources') && !name.includes('zsync') && !name.includes('web')) {
                
                let distro = 'Generic';
                if (name.includes('ubuntu') || name.includes('debian') || name.endsWith('.deb')) {
                    distro = 'Debian';
                } else if (name.includes('fedora') || name.includes('rhel') || name.endsWith('.rpm')) {
                    distro = 'Fedora';
                } else if (name.includes('arch')) {
                    distro = 'Arch Linux';
                } else if (name.endsWith('.appimage') || name.endsWith('.snap') || name.endsWith('.flatpak')) {
                    distro = 'Everywhere';
                }
                
                if (!categorized.linux[distro]) {
                    categorized.linux[distro] = [];
                }
                categorized.linux[distro].push(assetData);
            }
        });

        // Sort Windows builds: MSI first, then Portable, then NoGPU
        Object.keys(categorized.windows).forEach(arch => {
            categorized.windows[arch].sort((a, b) => {
                if (a.isMSI && !b.isMSI) return -1;
                if (!a.isMSI && b.isMSI) return 1;
                if (a.isNoGPU && !b.isNoGPU) return 1;
                if (!a.isNoGPU && b.isNoGPU) return -1;
                if (a.isArm && !b.isArm) return 1;
                if (!a.isArm && b.isArm) return -1;
                return 0;
            });
        });
        Object.keys(categorized.macos).forEach(() => {
            categorized.macos.sort((a, b) => {
                if (a.isNoGPU && !b.isNoGPU) return 1;
                if (!a.isNoGPU && b.isNoGPU) return -1;
                if (a.isArm && !b.isArm) return -1;
                if (!a.isArm && b.isArm) return 1;
                return 0;
            });
        });

        Object.keys(categorized.linux).forEach(distro => {
            categorized.linux[distro].sort((a, b) => {
                if (a.isArm && !b.isArm) return 1;
                if (!a.isArm && b.isArm) return -1;
                return 0;
            });
        });

        return categorized;
    };

    const handleDownload = (url) => {
        window.open(url, '_blank');
    };

    const calculateDropdownHeight = (buttonElement) => {
        if (!buttonElement) return 400;
        const buttonRect = buttonElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - buttonRect.bottom - 16; // 16px margin
        return Math.max(200, Math.min(spaceBelow, 500)); // Min 200px, max 500px
    };

    const handleDropdownOpen = (dropdown, event) => {
        const maxHeight = calculateDropdownHeight(event.currentTarget);
        setDropdownMaxHeight(maxHeight);
        setOpenDropdown(openDropdown === dropdown ? null : dropdown);
    };

    const getPrimaryDownload = (assets) => {
        if (detectedOS === 'windows') {
            const arch = detectedArch === 'arm' ? 'arm64' : 'x64';
            // Prefer MSI installer
            const msiBuilds = assets.windows[arch]?.filter(a => a.isMSI);
            if (msiBuilds && msiBuilds.length > 0) return msiBuilds[0];
            // Fallback to portable
            return assets.windows[arch]?.[0];
        } else if (detectedOS === 'macos') {
            const arch = detectedArch === 'arm' ? 'arm64' : 'x64';
            return assets.macos?.find(a => 
                arch === 'arm64' ? a.name.toLowerCase().includes('arm64') : !a.name.toLowerCase().includes('arm64')
            );
        } else if (detectedOS === 'linux') {
            // For Linux, prefer .deb for simplicity
            const debBuilds = assets.linux['Ubuntu/Debian'];
            if (debBuilds && debBuilds.length > 0) {
                const arch = detectedArch === 'arm' ? 'arm64' : 'x64';
                return debBuilds.find(a => a.name.toLowerCase().includes(arch === 'arm64' ? 'arm64' : 'x86_64'));
            }
            // Fallback to first available
            const firstDistro = Object.values(assets.linux)[0];
            return firstDistro?.[0];
        }
        return null;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[300px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                <p className="text-gray-300">Loading latest release...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-8 min-h-[300px]">
                <p className="text-red-400">Error loading releases: {error}</p>
                <button
                    onClick={fetchLatestRelease}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const assets = categorizeAssets();
    const primaryDownload = getPrimaryDownload(assets);

    return (
        <div className="flex flex-col items-center gap-6 p-8">
            {/* Release Info */}
            <div className="text-center">
                <p className="text-gray-300 mt-2">
                    {buildType === "nightly" ? "Nightly" : releases.tag_name} • Released {new Date(releases.updated_at).toLocaleDateString()}
                </p>
            </div>

            {/* Build Type Slider */}
            <div className="flex items-center gap-3 bg-gray-800 p-1.5 rounded-xl border border-gray-700">
                <button
                    onClick={() => setBuildType('stable')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                        buildType === 'stable'
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    <Sun className="w-4 h-4" />
                    <span>Stable Release</span>
                </button>
                <button
                    onClick={() => setBuildType('nightly')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                        buildType === 'nightly'
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                    <Moon className="w-4 h-4" />
                    <span>Nightly Build</span>
                </button>
            </div>

            {/* Primary Download Button */}
            {primaryDownload && (
                <div className="flex flex-col items-center gap-3">
                    <button
                        onClick={() => handleDownload(primaryDownload.url)}
                        className={`flex items-center gap-3 px-8 py-4 bg-gradient-to-r ${
                            buildType === 'stable' 
                                ? 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                                : 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                        } text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
                    >
                        <Download className="w-5 h-5" />
                        <div className="flex flex-col items-start">
                            <span>{primaryDownload.friendlyName}</span>
                            <span className={buildType === 'stable' ? 'text-xs text-blue-100' : 'text-xs text-purple-100'}>
                                {primaryDownload.size} • {primaryDownload.name}
                            </span>
                        </div>
                    </button>
                </div>
            )}

            {/* Platform-specific dropdowns */}
            <div className="flex flex-wrap gap-4 justify-center max-w-4xl">
                {/* Windows Dropdown */}
                {(assets.windows.x64.length > 0 || assets.windows.arm64.length > 0) && (
                    <div 
                        className="relative"
                        data-dropdown-container
                        onMouseEnter={() => setHoveredDropdown('windows')}
                        onMouseLeave={() => setHoveredDropdown(null)}
                    >
                        <button
                            onClick={(e) => handleDropdownOpen('windows', e)}
                            className={`flex items-center gap-2 px-5 py-3 bg-gray-800 border-2 rounded-lg font-medium text-gray-200 transition-all duration-200 ${
                                hoveredDropdown === 'windows' || openDropdown === 'windows'
                                    ? 'border-gray-500 shadow-lg transform scale-105'
                                    : 'border-gray-700 hover:border-gray-600'
                            }`}
                        >
                            <Grid2x2 className="w-5 h-5" />
                            <span>Windows</span>
                            <span className="text-xs text-gray-400">({assets.windows.x64.length + assets.windows.arm64.length})</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'windows' ? 'rotate-180' : ''}`} />
                        </button>

                        {openDropdown === 'windows' && (
                            <div 
                                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 border-2 border-gray-700 rounded-lg shadow-xl z-10 min-w-[350px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
                                style={{ maxHeight: `${dropdownMaxHeight}px` }}
                            >
                                {Object.entries(assets.windows).map(([arch, builds]) => {
                                    if (builds.length === 0) return null;
                                    return (
                                        <div key={arch}>
                                            <div className="px-5 py-0.5 bg-gray-900 border-b border-gray-700">
                                                <span className="text-xs font-semibold text-gray-400 uppercase">{arch}</span>
                                            </div>
                                            {builds.map((asset, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => {
                                                        handleDownload(asset.url);
                                                        setOpenDropdown(null);
                                                    }}
                                                    className="block w-full px-5 py-3 text-left hover:bg-gray-700 transition-colors duration-150 border-b border-gray-700 last:border-b-0"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <Download className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-100">{asset.friendlyName}</p>
                                                            <p className="text-xs text-gray-400">{asset.size} • {asset.name}</p>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* macOS Dropdown */}
                {assets.macos.length > 0 && (
                    <div 
                        className="relative"
                        data-dropdown-container
                        onMouseEnter={() => setHoveredDropdown('macos')}
                        onMouseLeave={() => setHoveredDropdown(null)}
                    >
                        <button
                            onClick={(e) => handleDropdownOpen('macos', e)}
                            className={`flex items-center gap-2 px-5 py-3 bg-gray-800 border-2 rounded-lg font-medium text-gray-200 transition-all duration-200 ${
                                hoveredDropdown === 'macos' || openDropdown === 'macos'
                                    ? 'border-gray-500 shadow-lg transform scale-105'
                                    : 'border-gray-700 hover:border-gray-600'
                            }`}
                        >
                            <Apple className="w-5 h-5" />
                            <span>macOS</span>
                            <span className="text-xs text-gray-400">({assets.macos.length})</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'macos' ? 'rotate-180' : ''}`} />
                        </button>

                        {openDropdown === 'macos' && (
                            <div 
                                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 border-2 border-gray-700 rounded-lg shadow-xl z-10 min-w-[300px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
                                style={{ maxHeight: `${dropdownMaxHeight}px` }}
                            >
                                {assets.macos.map((asset, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            handleDownload(asset.url);
                                            setOpenDropdown(null);
                                        }}
                                        className="block w-full px-5 py-3 text-left hover:bg-gray-700 transition-colors duration-150 border-b border-gray-700 last:border-b-0"
                                    >
                                        <div className="flex items-start gap-2">
                                            <Download className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-100">{asset.friendlyName}</p>
                                                <p className="text-xs text-gray-400">{asset.size} • {asset.name}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Linux Dropdown */}
                {Object.keys(assets.linux).length > 0 && (
                    <div 
                        className="relative"
                        data-dropdown-container
                        onMouseEnter={() => setHoveredDropdown('linux')}
                        onMouseLeave={() => setHoveredDropdown(null)}
                    >
                        <button
                            onClick={(e) => handleDropdownOpen('linux', e)}
                            className={`flex items-center gap-2 px-5 py-3 bg-gray-800 border-2 rounded-lg font-medium text-gray-200 transition-all duration-200 ${
                                hoveredDropdown === 'linux' || openDropdown === 'linux'
                                    ? 'border-gray-500 shadow-lg transform scale-105'
                                    : 'border-gray-700 hover:border-gray-600'
                            }`}
                        >
                            <Icon iconNode={penguin} className="w-5 h-5" />
                            <span>Linux</span>
                            <span className="text-xs text-gray-400">({Object.values(assets.linux).flat().length})</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === 'linux' ? 'rotate-180' : ''}`} />
                        </button>

                        {openDropdown === 'linux' && (
                            <div 
                                className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 border-2 border-gray-700 rounded-lg shadow-xl z-10 min-w-[350px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200"
                                style={{ maxHeight: `${dropdownMaxHeight}px` }}
                            >
                                {Object.entries(assets.linux).map(([distro, builds]) => (
                                    <div key={distro}>
                                        <div className="px-5 py-0.5 bg-gray-900 border-b border-gray-700">
                                            <span className="text-xs font-semibold text-gray-400 uppercase">{distro}</span>
                                        </div>
                                        {builds.map((asset, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => {
                                                    handleDownload(asset.url);
                                                    setOpenDropdown(null);
                                                }}
                                                className="block w-full px-5 py-3 text-left hover:bg-gray-700 transition-colors duration-150 border-b border-gray-700 last:border-b-0"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <Download className="w-4 h-4 mt-1 flex-shrink-0 text-gray-400" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-gray-100">{asset.friendlyName}</p>
                                                        <p className="text-xs text-gray-400">{asset.size} • {asset.name}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Additional Info */}
            <div className="text-center mt-4">
                <a
                    href={releases.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                    View full release notes on GitHub
                </a>
            </div>
        </div>
    );
};

export default DownloadButtons;
