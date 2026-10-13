export interface ThreadsContainerResult {
  containerId: string;
}

export interface ThreadsPublishResult {
  postId: string;
  permalink?: string;
}

export class MetaThreadsPublisherAdapter {
  private readonly baseUrl = 'https://graph.threads.net/v1.0';

  public async createTextContainer(params: {
    externalAccountId: string;
    accessToken: string;
    text: string;
    linkAttachment?: string;
  }): Promise<ThreadsContainerResult> {
    const url = `${this.baseUrl}/${params.externalAccountId}/threads`;

    const bodyData = new URLSearchParams({
      media_type: 'TEXT',
      text: params.text,
      access_token: params.accessToken,
    });

    if (params.linkAttachment) {
      bodyData.append('link_attachment', params.linkAttachment);
    }

    const res = await fetch(url, {
      method: 'POST',
      body: bodyData,
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.id) {
      const errMsg =
        data.error?.message || `HTTP ${res.status}: Gagal membuat media container teks Threads.`;
      const errSubcode = data.error?.error_subcode ? ` (Subcode: ${data.error.error_subcode})` : '';
      throw new Error(`[MetaThreadsApiError] ${errMsg}${errSubcode}`);
    }

    return { containerId: data.id };
  }

  public async createImageContainer(params: {
    externalAccountId: string;
    accessToken: string;
    imageUrl: string;
    text?: string;
  }): Promise<ThreadsContainerResult> {
    const url = `${this.baseUrl}/${params.externalAccountId}/threads`;

    const bodyData = new URLSearchParams({
      media_type: 'IMAGE',
      image_url: params.imageUrl,
      access_token: params.accessToken,
    });

    if (params.text) {
      bodyData.append('text', params.text);
    }

    const res = await fetch(url, {
      method: 'POST',
      body: bodyData,
    });

    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok || !data.id) {
      const errMsg =
        data.error?.message || `HTTP ${res.status}: Gagal membuat media container gambar Threads.`;
      const errSubcode = data.error?.error_subcode ? ` (Subcode: ${data.error.error_subcode})` : '';
      throw new Error(`[MetaThreadsApiError] ${errMsg}${errSubcode}`);
    }

    return { containerId: data.id };
  }

  public async checkContainerStatus(params: {
    containerId: string;
    accessToken: string;
  }): Promise<{ status: 'FINISHED' | 'IN_PROGRESS' | 'ERROR'; errorMessage?: string }> {
    const url = `${this.baseUrl}/${params.containerId}?fields=status,error_message&access_token=${params.accessToken}`;

    const res = await fetch(url);
    const data = (await res.json().catch(() => ({}))) as any;

    if (!res.ok) {
      return {
        status: 'ERROR',
        errorMessage: data.error?.message || 'Gagal memeriksa status container Threads.',
      };
    }

    const statusCode = (data.status || data.status_code || '').toUpperCase();
    if (statusCode === 'FINISHED' || statusCode === 'PUBLISHED') return { status: 'FINISHED' };
    if (statusCode === 'IN_PROGRESS') return { status: 'IN_PROGRESS' };
    if (statusCode === 'ERROR') {
      return {
        status: 'ERROR',
        errorMessage: data.error_message || 'Pemrosesan media container Threads gagal di server Meta.',
      };
    }

    if (data.id) return { status: 'FINISHED' };

    return {
      status: 'ERROR',
      errorMessage: data.error_message || 'Pemrosesan container gagal di server Threads.',
    };
  }

  public async publishContainer(params: {
    externalAccountId: string;
    accessToken: string;
    creationId: string;
  }): Promise<ThreadsPublishResult> {
    const url = `${this.baseUrl}/${params.externalAccountId}/threads_publish`;

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
      const errMsg =
        data.error?.message || `HTTP ${res.status}: Gagal mempublikasikan postingan Threads.`;
      throw new Error(`[MetaThreadsApiError] ${errMsg}`);
    }

    // Ambil permalink postingan
    let permalink: string | undefined;
    try {
      const detailRes = await fetch(
        `${this.baseUrl}/${data.id}?fields=permalink&access_token=${params.accessToken}`
      );
      const detailData = (await detailRes.json()) as any;
      permalink = detailData.permalink;
    } catch {}

    return {
      postId: data.id,
      permalink: permalink || `https://www.threads.net/post/${data.id}`,
    };
  }
}
