import {
  ISocialPublisherPort,
  SocialMediaUploadResult,
  ContainerStatusResult,
  SocialMediaPublishResult,
} from '@polaris/core-domain';

export class MetaInstagramPublisherAdapter implements ISocialPublisherPort {
  private readonly graphApiBase = 'https://graph.instagram.com/v21.0';

  public async createImageContainer(params: {
    externalAccountId: string;
    accessToken: string;
    imageUrl: string;
    caption: string;
  }): Promise<SocialMediaUploadResult> {
    const url = `${this.graphApiBase}/${params.externalAccountId}/media`;

    const bodyData = new URLSearchParams({
      image_url: params.imageUrl,
      caption: params.caption,
      access_token: params.accessToken,
    });

    const res = await fetch(url, {
      method: 'POST',
      body: bodyData,
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.id) {
      const errMsg = data.error?.message || `HTTP ${res.status}: Gagal membuat media container.`;
      const errSubcode = data.error?.error_subcode ? ` (Subcode: ${data.error.error_subcode})` : '';
      throw new Error(`[MetaGraphApiError] ${errMsg}${errSubcode}`);
    }

    return { containerId: data.id };
  }

  public async createCarouselItem(params: {
    externalAccountId: string;
    accessToken: string;
    imageUrl: string;
  }): Promise<SocialMediaUploadResult> {
    const url = `${this.graphApiBase}/${params.externalAccountId}/media`;

    const bodyData = new URLSearchParams({
      image_url: params.imageUrl,
      is_carousel_item: 'true',
      access_token: params.accessToken,
    });

    const res = await fetch(url, {
      method: 'POST',
      body: bodyData,
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.id) {
      const errMsg = data.error?.message || `HTTP ${res.status}: Gagal membuat carousel item container.`;
      const errSubcode = data.error?.error_subcode ? ` (Subcode: ${data.error.error_subcode})` : '';
      throw new Error(`[MetaGraphApiError] ${errMsg}${errSubcode}`);
    }

    return { containerId: data.id };
  }

  public async createCarouselContainer(params: {
    externalAccountId: string;
    accessToken: string;
    children: string[];
    caption: string;
  }): Promise<SocialMediaUploadResult> {
    const url = `${this.graphApiBase}/${params.externalAccountId}/media`;

    const bodyData = new URLSearchParams({
      media_type: 'CAROUSEL',
      children: params.children.join(','),
      caption: params.caption,
      access_token: params.accessToken,
    });

    const res = await fetch(url, {
      method: 'POST',
      body: bodyData,
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.id) {
      const errMsg = data.error?.message || `HTTP ${res.status}: Gagal membuat carousel parent container.`;
      const errSubcode = data.error?.error_subcode ? ` (Subcode: ${data.error.error_subcode})` : '';
      throw new Error(`[MetaGraphApiError] ${errMsg}${errSubcode}`);
    }

    return { containerId: data.id };
  }

  public async checkContainerStatus(params: {
    containerId: string;
    accessToken: string;
  }): Promise<ContainerStatusResult> {
    const url = `${this.graphApiBase}/${params.containerId}?fields=status_code,status&access_token=${params.accessToken}`;

    const res = await fetch(url);
    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok) {
      return {
        status: 'ERROR',
        errorMessage: data.error?.message || 'Gagal memeriksa status container.',
      };
    }

    const code = (data.status_code || '').toUpperCase();
    if (code === 'FINISHED') return { status: 'FINISHED' };
    if (code === 'IN_PROGRESS') return { status: 'IN_PROGRESS' };
    if (code === 'EXPIRED') return { status: 'EXPIRED' };
    if (!code && data.id) return { status: 'FINISHED' };

    return {
      status: 'ERROR',
      errorMessage: data.status || 'Pemrosesan media container gagal di server Meta.',
    };
  }

  public async publishMedia(params: {
    externalAccountId: string;
    accessToken: string;
    creationId: string;
  }): Promise<SocialMediaPublishResult> {
    const url = `${this.graphApiBase}/${params.externalAccountId}/media_publish`;

    const bodyData = new URLSearchParams({
      creation_id: params.creationId,
      access_token: params.accessToken,
    });

    const res = await fetch(url, {
      method: 'POST',
      body: bodyData,
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.id) {
      const errMsg = data.error?.message || `HTTP ${res.status}: Gagal mempublikasikan media.`;
      throw new Error(`[MetaGraphApiError] ${errMsg}`);
    }

    // Ambil permalink publik postingan
    let permalink: string | undefined;
    try {
      const detailRes = await fetch(
        `${this.graphApiBase}/${data.id}?fields=permalink&access_token=${params.accessToken}`
      );
      const detailData = (await detailRes.json()) as any;
      permalink = detailData.permalink;
    } catch {}

    return {
      postId: data.id,
      permalink,
    };
  }
}
