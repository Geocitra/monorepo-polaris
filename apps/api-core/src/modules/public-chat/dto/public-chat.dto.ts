import {
    ArrayMaxSize,
    IsArray,
    IsIn,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageTurnDto {
    @IsIn(['user', 'assistant'], { message: 'Role pesan harus user atau assistant.' })
    role!: 'user' | 'assistant';

    @IsString({ message: 'Konten riwayat harus berupa teks.' })
    @IsNotEmpty()
    @MaxLength(250, { message: 'Masing-masing riwayat obrolan maksimal 250 karakter.' })
    content!: string;
}

export class SendPublicChatDto {
    @IsString({ message: 'Pesan pertanyaan wajib berupa teks.' })
    @IsNotEmpty({ message: 'Pesan pertanyaan tidak boleh kosong.' })
    @MaxLength(250, { message: 'Pertanyaan maksimal 250 karakter.' })
    message!: string;

    @IsOptional()
    @IsArray({ message: 'Riwayat obrolan harus berupa array.' })
    @ArrayMaxSize(3, { message: 'Riwayat percakapan dibatasi maksimal 3 pesan terakhir.' })
    @ValidateNested({ each: true })
    @Type(() => ChatMessageTurnDto)
    history?: ChatMessageTurnDto[];
}

export interface PublicChatResponseDto {
    reply: string;
    suggestedAction: 'VIEW_PRICING' | 'REGISTER' | 'NONE';
    isSafeRefusal: boolean;
    tokensUsed: number;
}