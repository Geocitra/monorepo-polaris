export interface SocialMediaUploadResult {
  containerId: string;
}

export interface SocialMediaPublishResult {
  postId: string;
  permalink?: string;
}

export interface ContainerStatusResult {
  status: 'IN_PROGRESS' | 'FINISHED' | 'ERROR' | 'EXPIRED';
  errorMessage?: string;
}

export interface ISocialPublisherPort {
  createImageContainer(params: {
    externalAccountId: string;
    accessToken: string;
    imageUrl: string;
    caption: string;
  }): Promise<SocialMediaUploadResult>;

  createCarouselItem(params: {
    externalAccountId: string;
    accessToken: string;
    imageUrl: string;
  }): Promise<SocialMediaUploadResult>;

  createCarouselContainer(params: {
    externalAccountId: string;
    accessToken: string;
    children: string[];
    caption: string;
  }): Promise<SocialMediaUploadResult>;

  checkContainerStatus(params: {
    containerId: string;
    accessToken: string;
  }): Promise<ContainerStatusResult>;

  publishMedia(params: {
    externalAccountId: string;
    accessToken: string;
    creationId: string;
  }): Promise<SocialMediaPublishResult>;
}
