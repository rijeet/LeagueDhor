'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PersonService, Person } from '../../services/person.service';
import { CrimeService } from '../../services/crime.service';
import { AuthService } from '../../services/auth.service';
import { isTokenExpired } from '../../utils/token';
import { PLATFORMS, ProfileUrl, Platform, detectPlatform } from '../../utils/platforms';

export default function AddCrimePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const personId = searchParams.get('personId');
  const authService = new AuthService();

  const [person, setPerson] = useState<Person | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [personName, setPersonName] = useState('');
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [personImageUrl, setPersonImageUrl] = useState<string>('');
  const [crimeContextImage, setCrimeContextImage] = useState<File | null>(null);
  const [crimeContextImageUrl, setCrimeContextImageUrl] = useState<string>('');
  const [location, setLocation] = useState('Bangladesh');
  const [profileUrls, setProfileUrls] = useState<ProfileUrl[]>([{ platform: 'facebook', url: '' }]);
  const [sources, setSources] = useState<string[]>(['']);
  const [tagsInput, setTagsInput] = useState('');
  
  // Error and validation states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<{
    personImage?: boolean;
    crimeImage?: boolean;
  }>({});

  useEffect(() => {
    const checkAuth = async () => {
      const token = authService.getAccessToken();
      if (!token) {
        // Redirect to login with redirect parameter
        const currentPath = `/add-crime${personId ? `?personId=${personId}` : ''}`;
        router.push('/login?redirect=' + encodeURIComponent(currentPath));
        return;
      }

      // Check if token is expired
      if (isTokenExpired(token)) {
        // Token expired, try refresh
        const refreshToken = authService.getRefreshToken();
        if (refreshToken) {
          const tokens = await authService.refreshUserToken() || await authService.refreshAdminToken();
          if (!tokens) {
            router.push('/login');
            return;
          }
        } else {
          router.push('/login');
          return;
        }
      }

      if (personId) {
        const personService = new PersonService();
        const crimeService = new CrimeService();
        
        // First get person, then get crimes using slug
        personService
          .getById(personId)
          .then(async (p) => {
            setPerson(p);
            setPersonName(p.name);
            setPersonImageUrl(p.imageUrl || '');
            
            // Get crimes for this person using slug
            try {
              const crimes = await crimeService.getByPersonSlug(p.slug);
              
              // Get profile URLs and location from the latest crime
              if (crimes.length > 0) {
                const latestCrime = crimes[0];
                
                // Set location from latest crime
                if (latestCrime.location) {
                  setLocation(latestCrime.location);
                }
                
                // Parse and set profile URLs from latest crime
                if (latestCrime.profileUrl) {
                  const parsedUrls = latestCrime.profileUrl
                    .split(',')
                    .map(profileUrlStr => {
                      const trimmed = profileUrlStr.trim();
                      const firstColon = trimmed.indexOf(':');
                      if (firstColon === -1) return null;
                      const platform = trimmed.substring(0, firstColon).trim() as Platform;
                      const url = trimmed.substring(firstColon + 1).trim();
                      if (!PLATFORMS.find(pl => pl.value === platform)) return null;
                      return { platform, url };
                    })
                    .filter((p): p is ProfileUrl => p !== null && p.url.length > 0);
                  
                  if (parsedUrls.length > 0) {
                    setProfileUrls(parsedUrls);
                  }
                }
              }
            } catch (error) {
              console.error('Failed to load crimes:', error);
              // Continue even if crimes fail to load
            }
          })
          .catch(() => {
            router.push('/');
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [personId, router]);

  // Validate person name - only letters, spaces, and common name characters (no numbers, special chars, emojis)
  const validatePersonName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Person name is required';
    }

    const trimmedName = name.trim();
    
    if (trimmedName.length < 2) {
      return 'Person name must be at least 2 characters';
    }

    if (trimmedName.length > 200) {
      return 'Person name must be less than 200 characters';
    }

    // Allow only letters (including accented characters), spaces, hyphens, apostrophes, and periods
    // This regex allows: A-Z, a-z, accented characters, spaces, hyphens, apostrophes, periods
    // It rejects: numbers, special characters, emojis
    // Using character ranges that work without Unicode flag
    const namePattern = /^[a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\s'.-]+$/;
    
    if (!namePattern.test(trimmedName)) {
      return 'Person name can only contain letters, spaces, hyphens, apostrophes, and periods. No numbers, special characters, or emojis allowed.';
    }

    return null;
  };

  // Validate image file
  const validateImageFile = (file: File): string | null => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return 'Please select a valid image file (JPEG, PNG, WebP, or GIF)';
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return 'Image size must be less than 10MB';
    }

    return null;
  };

  const handlePersonImageSelect = (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, personImage: error }));
      return;
    }

    // Clear previous error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.personImage;
      return newErrors;
    });

    setPersonImage(file);
    // Show local preview immediately (no upload yet)
    const localUrl = URL.createObjectURL(file);
    setPersonImageUrl(localUrl);
  };

  const handleCrimeContextImageSelect = (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      setErrors((prev) => ({ ...prev, crimeImage: error }));
      return;
    }

    // Clear previous error
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.crimeImage;
      return newErrors;
    });

    setCrimeContextImage(file);
    // Show local preview immediately (no upload yet)
    const localUrl = URL.createObjectURL(file);
    setCrimeContextImageUrl(localUrl);
  };

  const uploadImage = async (file: File, type: 'personImage' | 'crimeImage'): Promise<string | null> => {
    try {
      setUploadProgress((prev) => ({ ...prev, [type]: true }));

      // Get personName - must be available for folder structure
      const personNameForUpload = personName.trim() || (person?.name || '');
      
      if (!personNameForUpload) {
        const errorMsg = 'Person name is required for image upload';
        setErrors((prev) => ({ ...prev, [type === 'personImage' ? 'personImage' : 'crimeImage']: errorMsg }));
        setUploadProgress((prev) => ({ ...prev, [type]: false }));
        return null;
      }

      const formData = new FormData();
      formData.append('file', file);

      // Add metadata for folder structure and custom metadata
      const imageType = type === 'personImage' ? 'person' : 'crime';
      
      // Always include personName for folder structure
      formData.append('personName', personNameForUpload);
      formData.append('imageType', imageType);
      
      if (personId) {
        formData.append('personId', personId);
      }

      // Add tags if available (max 3)
      const tags = parseTags(tagsInput).slice(0, 3);
      if (tags.length > 0) {
        formData.append('tags', tags.join(','));
      }

      console.log(`Uploading ${type}:`, { 
        name: file.name, 
        size: file.size, 
        type: file.type,
        personName: personNameForUpload,
        imageType,
        personId,
        tags: tags.length > 0 ? tags : 'none',
      });

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      console.log(`Upload response (${response.status}):`, responseText);

      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          errorData = { error: responseText || 'Upload failed' };
        }
        throw new Error(errorData.error || errorData.message || `Upload failed with status ${response.status}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse response:', responseText);
        throw new Error('Invalid response from server');
      }
      
      const imageUrl = data.url;
      
      if (!imageUrl) {
        console.error('No URL in response:', data);
        throw new Error('Server did not return an image URL');
      }

      console.log(`Upload successful for ${type}:`, imageUrl);
      return imageUrl;
    } catch (error: any) {
      console.error(`Image upload failed for ${type}:`, error);
      const errorMessage = error.message || 'Failed to upload image. Please check your connection and try again.';
      setErrors((prev) => ({ ...prev, [type]: errorMessage }));
      return null;
    } finally {
      setUploadProgress((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleAddSource = () => {
    setSources([...sources, '']);
  };

  const handleSourceChange = (index: number, value: string) => {
    const newSources = [...sources];
    newSources[index] = value;
    setSources(newSources);
  };

  const handleRemoveSource = (index: number) => {
    setSources(sources.filter((_, i) => i !== index));
  };

  // Parse comma-separated tags
  const parseTags = (input: string): string[] => {
    return input
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  // Validate form before submission
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate person name - only if personId doesn't exist (it's readonly when personId exists)
    if (!personId) {
      const nameError = validatePersonName(personName);
      if (nameError) {
        newErrors.personName = nameError;
      }
    }

    // Validate location - only if personId doesn't exist (it's readonly when personId exists)
    if (!personId) {
      if (!location || !location.trim()) {
        newErrors.location = 'Location is required';
      }
    }

    // Validate profile URLs - only if personId doesn't exist (it's readonly when personId exists)
    if (!personId) {
      const validProfileUrls = profileUrls.filter(p => p.url.trim());
      if (validProfileUrls.length === 0) {
        newErrors.profileUrls = 'At least one profile URL is required';
      } else {
        validProfileUrls.forEach((profileUrl, index) => {
          try {
            let urlToValidate = profileUrl.url.trim();
            // Auto-add https:// if no protocol is provided
            if (!urlToValidate.match(/^https?:\/\//i)) {
              urlToValidate = 'https://' + urlToValidate;
            }
            new URL(urlToValidate);
          } catch {
            newErrors[`profileUrl_${index}`] = 'Please enter a valid URL';
          }
        });
      }
    }

    // Validate source URLs (always required)
    const validSources = sources.filter(s => s.trim());
    if (validSources.length === 0) {
      newErrors.sources = 'At least one source/evidence link is required';
    } else {
      sources.forEach((source, index) => {
        if (source.trim()) {
          try {
            let urlToValidate = source.trim();
            // Auto-add https:// if no protocol is provided
            if (!urlToValidate.match(/^https?:\/\//i)) {
              urlToValidate = 'https://' + urlToValidate;
            }
            new URL(urlToValidate);
          } catch {
            newErrors[`source_${index}`] = 'Please enter a valid URL';
          }
        }
      });
    }

    // Validate tags (always required, max 3)
    const tags = parseTags(tagsInput);
    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (tags.length > 3) {
      newErrors.tags = 'Maximum 3 tags allowed';
    }

    // Validate crime image (always required)
    if (!crimeContextImage && !crimeContextImageUrl) {
      newErrors.crimeImage = 'Crime image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);

    try {
      // Step 1: Upload images if they exist
      let uploadedPersonImageUrl = personImageUrl;
      let uploadedCrimeImageUrl = crimeContextImageUrl;

      // Upload person image if it's a local file (blob URL)
      if (personImage && personImageUrl?.startsWith('blob:')) {
        const url = await uploadImage(personImage, 'personImage');
        if (url) {
          uploadedPersonImageUrl = url;
          // Clean up local URL
          URL.revokeObjectURL(personImageUrl);
        } else {
          // Error already set in uploadImage
          setSubmitting(false);
          return;
        }
      }

      // Upload crime context image if it's a local file (blob URL)
      if (crimeContextImage && crimeContextImageUrl?.startsWith('blob:')) {
        const url = await uploadImage(crimeContextImage, 'crimeImage');
        if (url) {
          uploadedCrimeImageUrl = url;
          // Clean up local URL
          URL.revokeObjectURL(crimeContextImageUrl);
        } else {
          // Error already set in uploadImage
          setSubmitting(false);
          return;
        }
      }

      // Step 2: Create crime with uploaded image URLs
      const crimeService = new CrimeService();
      const crimeImages = uploadedCrimeImageUrl ? [uploadedCrimeImageUrl] : [];
      
      // Build request payload
      const tags = parseTags(tagsInput);
      const validProfileUrls = profileUrls.filter(p => p.url.trim()).map(p => {
        let url = p.url.trim();
        // Auto-add https:// if no protocol is provided
        if (!url.match(/^https?:\/\//i)) {
          url = 'https://' + url;
        }
        return { platform: p.platform, url };
      });
      const payload: any = {
        location: location,
        crimeImages,
        sources: sources.filter((s) => s.trim()),
        profileUrl: validProfileUrls.map(p => `${p.platform}:${p.url}`).join(','), // Store as comma-separated platform:url pairs
        tags: tags.slice(0, 3), // Limit to max 3 tags
      };

      // If we have an existing personId, use it
      if (personId) {
        payload.personId = personId;
      } else {
        // Otherwise, create a new person with the provided details
        payload.person = {
          name: personName.trim(),
          imageUrl: uploadedPersonImageUrl || undefined,
        };
      }

      await crimeService.create(payload);

      // Success - redirect to home
      router.push('/');
    } catch (error: any) {
      console.error('Failed to create crime:', error);
      
      // Extract error message from response
      let errorMessage = 'Failed to create crime report. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors((prev) => ({ ...prev, submit: errorMessage }));
      
      // Scroll to error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center px-4 py-8">
        <div className="bg-[#1a1a1a] border-2 border-[#DC143C]/30 rounded-lg h-32 w-full max-w-6xl animate-pulse" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#DC143C] to-[#8B0000] bg-clip-text text-transparent">
            Add Crime Report
          </h1>
          <p className="text-sm text-gray-400">
            Document the truth — your report remains anonymous
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border-2 border-[#DC143C]/30 rounded-lg shadow-2xl shadow-[#DC143C]/10 p-8 backdrop-blur-sm">
        {/* Global Error Message */}
        {errors.submit && (
          <div className="mb-6 p-4 bg-[#8B0000]/20 border-2 border-[#DC143C] rounded-lg backdrop-blur-sm" data-error>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚠</span>
              <p className="text-[#FF6B6B] font-medium">{errors.submit}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Person Name - Readonly when personId exists */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Person Name <span className="text-[#DC143C]">*</span>
                {personId && <span className="ml-2 text-xs text-gray-500 font-normal">(Readonly)</span>}
              </label>
              <input
                type="text"
                value={personName}
                onChange={(e) => {
                  if (personId) return; // Prevent changes when personId exists
                  const value = e.target.value;
                  // Real-time validation: prevent invalid characters
                  // Using character ranges that work without Unicode flag
                  const namePattern = /^[a-zA-Z\u00C0-\u017F\u0100-\u024F\u1E00-\u1EFF\s'.-]*$/;
                  if (namePattern.test(value) || value === '') {
                    setPersonName(value);
                    // Clear error if input becomes valid
                    if (errors.personName) {
                      const nameError = validatePersonName(value);
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        if (nameError) {
                          newErrors.personName = nameError;
                        } else {
                          delete newErrors.personName;
                        }
                        return newErrors;
                      });
                    }
                  }
                  // If invalid character, don't update the value (prevent input)
                }}
                onBlur={() => {
                  if (personId) return; // Skip validation when personId exists
                  // Validate on blur for better UX
                  const nameError = validatePersonName(personName);
                  if (nameError) {
                    setErrors((prev) => ({ ...prev, personName: nameError }));
                  } else {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.personName;
                      return newErrors;
                    });
                  }
                }}
                disabled={!!personId}
                data-error={errors.personName ? true : undefined}
                className={`w-full px-4 py-3 border-2 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  personId
                    ? 'border-[#DC143C]/50 bg-[#1a1a1a] text-gray-500 cursor-not-allowed'
                    : errors.personName
                    ? 'border-[#DC143C] focus:ring-[#DC143C]/20 bg-[#1a1a1a]'
                    : 'border-[#DC143C]/50 bg-[#1a1a1a] focus:border-[#DC143C] focus:ring-[#DC143C]/20'
                }`}
                placeholder="Enter person's full name (letters only)"
              />
              {errors.personName && (
                <p className="mt-1 text-sm text-[#FF6B6B]">{errors.personName}</p>
              )}
            </div>

            {/* Person Image Upload - Readonly when personId exists */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Person Image
                {personId && <span className="ml-2 text-xs text-gray-500 font-normal">(Readonly)</span>}
              </label>
              <div
                className={`border-2 ${personId ? 'border-[#DC143C]/50 bg-[#1a1a1a]' : 'border-dashed'} rounded-lg p-6 transition-colors ${
                  personId
                    ? ''
                    : errors.personImage
                    ? 'border-[#DC143C] bg-[#8B0000]/10'
                    : 'border-[#DC143C]/50 hover:border-[#DC143C] bg-[#1a1a1a]'
                }`}
                data-error={errors.personImage ? true : undefined}
              >
                {!personId && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePersonImageSelect(file);
                    }}
                    disabled={submitting}
                    className="hidden"
                    id="person-image"
                  />
                )}
                <label
                  htmlFor={personId ? undefined : "person-image"}
                  className={`flex flex-col items-center justify-center ${personId ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {uploadProgress.personImage ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC143C] mb-2"></div>
                      <p className="text-sm text-gray-400">Uploading...</p>
                    </div>
                  ) : personImageUrl ? (
                    <img
                      src={personImageUrl}
                      alt="Person"
                      className="w-32 h-32 rounded-full object-cover mb-2 border-2 border-[#DC143C]/30"
                    />
                  ) : (
                    <>
                      <div className="text-4xl mb-2">📷</div>
                      {personId ? (
                        <p className="text-sm text-gray-500">No image available</p>
                      ) : (
                        <>
                          <p className="text-sm text-gray-400">Drag and drop or file selector</p>
                          <p className="text-xs text-gray-500 mt-1">Max 10MB, JPEG/PNG/WebP/GIF</p>
                        </>
                      )}
                    </>
                  )}
                </label>
                {errors.personImage && (
                  <p className="mt-2 text-sm text-[#FF6B6B] text-center">{errors.personImage}</p>
                )}
              </div>
            </div>

            {/* Crime Context Image Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Crime Context Image Upload
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                errors.crimeImage
                  ? 'border-[#DC143C] bg-[#8B0000]/10'
                  : 'border-[#DC143C]/50 hover:border-[#DC143C] bg-[#1a1a1a]'
              }`}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCrimeContextImageSelect(file);
                  }}
                  disabled={submitting}
                  className="hidden"
                  id="crime-context-image"
                />
                <label
                  htmlFor="crime-context-image"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  {uploadProgress.crimeImage ? (
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DC143C] mb-2"></div>
                      <p className="text-sm text-gray-400">Uploading...</p>
                    </div>
                  ) : crimeContextImageUrl ? (
                    <img
                      src={crimeContextImageUrl}
                      alt="Crime context"
                      className="w-full h-48 rounded-lg object-cover mb-2 border-2 border-[#DC143C]/30"
                    />
                  ) : (
                    <>
                      <div className="text-4xl mb-2">🖼️</div>
                      <p className="text-sm text-gray-400">Drag and drop or file selector</p>
                      <p className="text-xs text-gray-500 mt-1">Max 10MB, JPEG/PNG/WebP/GIF</p>
                    </>
                  )}
                </label>
                {errors.crimeImage && (
                  <p className="mt-2 text-sm text-[#FF6B6B] text-center">{errors.crimeImage}</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Location - Readonly when personId exists */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Location <span className="text-[#DC143C]">*</span>
                {personId && <span className="ml-2 text-xs text-gray-500 font-normal">(Readonly)</span>}
              </label>
              <select
                value={location}
                onChange={(e) => {
                  if (personId) return; // Prevent changes when personId exists
                  setLocation(e.target.value);
                  if (errors.location) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.location;
                      return newErrors;
                    });
                  }
                }}
                disabled={!!personId}
                data-error={errors.location ? true : undefined}
                className={`w-full px-4 py-3 border-2 rounded-md text-white focus:outline-none focus:ring-2 transition-all ${
                  personId
                    ? 'border-[#DC143C]/50 bg-[#1a1a1a] text-gray-500 cursor-not-allowed'
                    : errors.location
                    ? 'border-[#DC143C] focus:ring-[#DC143C]/20 bg-[#1a1a1a]'
                    : 'border-[#DC143C]/50 bg-[#1a1a1a] focus:border-[#DC143C] focus:ring-[#DC143C]/20'
                }`}
              >
                <option value="Bangladesh" className="bg-[#1a1a1a]">Bangladesh</option>
                <option value="Foreign" className="bg-[#1a1a1a]">Foreign</option>
              </select>
              {errors.location && (
                <p className="mt-1 text-sm text-[#FF6B6B]">{errors.location}</p>
              )}
            </div>

            {/* Profile URLs - Readonly when personId exists */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Profile URLs <span className="text-[#DC143C]">*</span>
                {personId && <span className="ml-2 text-xs text-gray-500 font-normal">(Readonly)</span>}
              </label>
              {errors.profileUrls && (
                <p className="mb-2 text-sm text-[#FF6B6B]">{errors.profileUrls}</p>
              )}
              <div className="space-y-3">
                {profileUrls.map((profileUrl, index) => (
                  <div key={index} className="flex gap-2">
                    <select
                      value={profileUrl.platform}
                      onChange={(e) => {
                        if (personId) return; // Prevent changes when personId exists
                        const newProfileUrls = [...profileUrls];
                        newProfileUrls[index].platform = e.target.value as Platform;
                        // Auto-detect platform from URL if URL exists
                        if (newProfileUrls[index].url) {
                          const detected = detectPlatform(newProfileUrls[index].url);
                          if (detected !== 'other') {
                            newProfileUrls[index].platform = detected;
                          }
                        }
                        setProfileUrls(newProfileUrls);
                      }}
                      disabled={!!personId}
                      className={`px-3 py-2 border-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#DC143C]/20 flex-shrink-0 w-32 transition-all ${
                        personId
                          ? 'border-[#DC143C]/50 bg-[#1a1a1a] text-gray-500 cursor-not-allowed'
                          : 'border-[#DC143C]/50 bg-[#1a1a1a] focus:border-[#DC143C]'
                      }`}
                    >
                      {PLATFORMS.map((platform) => (
                        <option key={platform.value} value={platform.value}>
                          {platform.icon} {platform.label}
                        </option>
                      ))}
                    </select>
                    <div className="flex-1">
                      <input
                        type="url"
                        value={profileUrl.url}
                        onChange={(e) => {
                          if (personId) return; // Prevent changes when personId exists
                          const newProfileUrls = [...profileUrls];
                          newProfileUrls[index].url = e.target.value;
                          // Auto-detect platform from URL
                          if (e.target.value) {
                            const detected = detectPlatform(e.target.value);
                            if (detected !== 'other') {
                              newProfileUrls[index].platform = detected;
                            }
                          }
                          setProfileUrls(newProfileUrls);
                          // Clear errors
                          if (errors[`profileUrl_${index}`] || errors.profileUrls) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors[`profileUrl_${index}`];
                              delete newErrors.profileUrls;
                              return newErrors;
                            });
                          }
                        }}
                        disabled={!!personId}
                        className={`w-full px-4 py-2 border-2 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                          personId
                            ? 'border-[#DC143C]/50 bg-[#1a1a1a] text-gray-500 cursor-not-allowed'
                            : errors[`profileUrl_${index}`]
                            ? 'border-[#DC143C] focus:ring-[#DC143C]/20 bg-[#1a1a1a]'
                            : 'border-[#DC143C]/50 bg-[#1a1a1a] focus:border-[#DC143C] focus:ring-[#DC143C]/20'
                        }`}
                        placeholder="https://facebook.com/username"
                      />
                      {errors[`profileUrl_${index}`] && (
                        <p className="mt-1 text-xs text-[#FF6B6B]">{errors[`profileUrl_${index}`]}</p>
                      )}
                    </div>
                    {!personId && profileUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setProfileUrls(profileUrls.filter((_, i) => i !== index));
                        }}
                        className="px-3 py-2 text-[#DC143C] hover:bg-[#8B0000]/20 rounded-md transition-colors flex-shrink-0"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                {!personId && (
                  <button
                    type="button"
                    onClick={() => setProfileUrls([...profileUrls, { platform: 'facebook', url: '' }])}
                    className="text-sm text-[#DC143C] hover:text-[#FF1744] font-medium transition-colors"
                  >
                    + Add Another Profile URL
                  </button>
                )}
              </div>
            </div>

            {/* Source / Evidence Links */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Source / Evidence Links <span className="text-[#DC143C]">*</span>
              </label>
              {errors.sources && (
                <p className="mb-2 text-sm text-[#FF6B6B]">{errors.sources}</p>
              )}
              <div className="space-y-2">
                {sources.map((source, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="url"
                        value={source}
                        onChange={(e) => {
                          handleSourceChange(idx, e.target.value);
                          if (errors[`source_${idx}`]) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors[`source_${idx}`];
                              return newErrors;
                            });
                          }
                        }}
                        data-error={errors[`source_${idx}`] ? true : undefined}
                        className={`w-full px-4 py-3 border-2 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                          errors[`source_${idx}`]
                            ? 'border-[#DC143C] focus:ring-[#DC143C]/20 bg-[#1a1a1a]'
                            : 'border-[#DC143C]/50 bg-[#1a1a1a] focus:border-[#DC143C] focus:ring-[#DC143C]/20'
                        }`}
                        placeholder="https://example.com/evidence"
                      />
                      {errors[`source_${idx}`] && (
                        <p className="mt-1 text-sm text-[#FF6B6B]">{errors[`source_${idx}`]}</p>
                      )}
                    </div>
                    {sources.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          handleRemoveSource(idx);
                          setErrors((prev) => {
                            const newErrors = { ...prev };
                            delete newErrors[`source_${idx}`];
                            return newErrors;
                          });
                        }}
                        className="px-4 py-3 bg-[#8B0000]/20 hover:bg-[#8B0000]/30 text-[#DC143C] rounded-md transition-colors border border-[#DC143C]/30"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tags <span className="text-[#DC143C]">*</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Limit to 3 tags by checking comma count
                  const commaCount = (value.match(/,/g) || []).length;
                  if (commaCount >= 3) {
                    // Allow only if the last comma is being typed (user can still delete)
                    const tags = value.split(',').filter(t => t.trim().length > 0);
                    if (tags.length > 3) {
                      return; // Prevent input if already has 3+ tags
                    }
                  }
                  setTagsInput(value);
                  // Clear error if user is typing
                  if (errors.tags) {
                    const parsedTags = parseTags(value);
                    if (parsedTags.length > 0 && parsedTags.length <= 3) {
                      setErrors((prev) => {
                        const newErrors = { ...prev };
                        delete newErrors.tags;
                        return newErrors;
                      });
                    }
                  }
                }}
                data-error={errors.tags ? true : undefined}
                className={`w-full px-4 py-3 border-2 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all ${
                  errors.tags
                    ? 'border-[#DC143C] focus:ring-[#DC143C]/20 bg-[#1a1a1a]'
                    : 'border-[#DC143C]/50 bg-[#1a1a1a] focus:border-[#DC143C] focus:ring-[#DC143C]/20'
                }`}
                placeholder="Bot, Pervert, Agent"
              />
              <div className="flex justify-between mt-1">
                {errors.tags ? (
                  <p className="text-sm text-[#FF6B6B]">{errors.tags}</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Maximum 3 tags separated by commas (e.g., Bot, Pervert, Agent)
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 mt-8 pt-8 border-t border-[#2a2a2a]">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border-2 border-[#DC143C]/50 rounded-md hover:border-[#DC143C] text-gray-300 hover:text-white transition-all font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-[#DC143C] to-[#8B0000] hover:from-[#FF1744] hover:to-[#DC143C] text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#DC143C]/30 font-semibold"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚡</span>
                <span>Submitting...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>⚔</span>
                <span>Submit Report</span>
              </span>
            )}
          </button>
        </div>
      </form>
      </div>
    </main>
  );
}
