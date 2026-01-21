import { NextRequest, NextResponse } from 'next/server';
import { config } from '../../../lib/config';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided. Please select an image file.' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, WebP, or GIF image.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    const backendFormData = new FormData();
    backendFormData.append('file', file);

    // Get additional metadata from FormData body (not headers/query params)
    const personName = formData.get('personName') as string | null;
    const imageType = (formData.get('imageType') as string | null) || 'crime';
    const personId = formData.get('personId') as string | null;
    const tags = formData.get('tags') as string | null;

    // Log metadata for debugging
    console.log('Upload metadata:', { personName, imageType, personId, tags });

    // Always pass metadata to backend (even if empty, backend will handle defaults)
    if (personName) {
      backendFormData.append('personName', personName);
    }
    if (imageType) {
      backendFormData.append('imageType', imageType);
    }
    if (personId) {
      backendFormData.append('personId', personId);
    }
    if (tags) {
      backendFormData.append('tags', tags);
    }

    const response = await fetch(`${config.apiUrl}/upload`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || errorData.error || 'Failed to upload image to server';
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // TransformInterceptor wraps response in { status, message, statusCode, data }
    // So the actual response is in data.data
    const imageUrl = data.data?.url || data.url;
    
    if (!imageUrl) {
      console.error('Backend response structure:', JSON.stringify(data, null, 2));
      return NextResponse.json(
        { error: 'Server did not return an image URL. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('fetch')) {
      return NextResponse.json(
        { error: 'Unable to connect to server. Please check your connection and try again.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred during upload. Please try again.' },
      { status: 500 }
    );
  }
}
