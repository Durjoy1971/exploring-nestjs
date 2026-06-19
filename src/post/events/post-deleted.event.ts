export class PostDeletedEvent {
  constructor(
    public readonly filePublicId: string,
    public readonly fileResourceType: string,
  ) {}
}
