export interface SourceLinkInfo {
  icon: string;
  label: string;
  domain: string;
}

export function getSourceLinkInfo(url: string): SourceLinkInfo {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = urlObj.hostname.toLowerCase();
    const domain = hostname.replace('www.', '');

    // News and Media Sites
    if (domain.includes('prothomalo.com') || domain.includes('prothom-alo')) {
      return { icon: '📰', label: 'Prothom Alo', domain };
    }
    if (domain.includes('bdnews24.com')) {
      return { icon: '📰', label: 'BDNews24', domain };
    }
    if (domain.includes('jugantor.com')) {
      return { icon: '📰', label: 'Jugantor', domain };
    }
    if (domain.includes('kalerkantho.com')) {
      return { icon: '📰', label: 'Kaler Kantho', domain };
    }
    if (domain.includes('ittefaq.com')) {
      return { icon: '📰', label: 'Ittefaq', domain };
    }
    if (domain.includes('somoynews.tv') || domain.includes('somoy')) {
      return { icon: '📺', label: 'Somoy TV', domain };
    }
    if (domain.includes('channel24.com')) {
      return { icon: '📺', label: 'Channel 24', domain };
    }
    if (domain.includes('ntv.com')) {
      return { icon: '📺', label: 'NTV', domain };
    }
    if (domain.includes('atnnews.com')) {
      return { icon: '📺', label: 'ATN News', domain };
    }

    // Social Media
    if (domain.includes('facebook.com') || domain.includes('fb.com')) {
      return { icon: '📘', label: 'Facebook', domain };
    }
    if (domain.includes('instagram.com')) {
      return { icon: '📷', label: 'Instagram', domain };
    }
    if (domain.includes('twitter.com') || domain.includes('x.com')) {
      return { icon: '🐦', label: 'Twitter/X', domain };
    }
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return { icon: '📺', label: 'YouTube', domain };
    }
    if (domain.includes('tiktok.com')) {
      return { icon: '🎵', label: 'TikTok', domain };
    }

    // Video Platforms
    if (domain.includes('vimeo.com')) {
      return { icon: '🎬', label: 'Vimeo', domain };
    }
    if (domain.includes('dailymotion.com')) {
      return { icon: '🎬', label: 'Dailymotion', domain };
    }

    // Document/File Sharing
    if (domain.includes('drive.google.com') || domain.includes('docs.google.com')) {
      return { icon: '📄', label: 'Google Drive', domain };
    }
    if (domain.includes('dropbox.com')) {
      return { icon: '📦', label: 'Dropbox', domain };
    }
    if (domain.includes('onedrive.com')) {
      return { icon: '☁️', label: 'OneDrive', domain };
    }

    // Image Hosting
    if (domain.includes('imgur.com')) {
      return { icon: '🖼️', label: 'Imgur', domain };
    }
    if (domain.includes('imagekit.io')) {
      return { icon: '🖼️', label: 'ImageKit', domain };
    }

    // Generic news/media indicators
    if (domain.includes('news') || domain.includes('media') || domain.includes('press')) {
      return { icon: '📰', label: 'News Source', domain };
    }

    // Default for unknown sources
    return { icon: '🔗', label: domain.split('.')[0] || 'Link', domain };
  } catch {
    // If URL parsing fails, return default
    return { icon: '🔗', label: 'Source Link', domain: 'unknown' };
  }
}

export function getSourceDisplayText(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const pathname = urlObj.pathname;
    const hostname = urlObj.hostname.replace('www.', '');
    
    // If pathname is meaningful, use it
    if (pathname && pathname !== '/' && pathname.length < 50) {
      return `${hostname}${pathname}`;
    }
    
    return hostname;
  } catch {
    return url.length > 50 ? `${url.substring(0, 50)}...` : url;
  }
}
