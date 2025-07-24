// src/bots/bot.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum BotStatus {
  ACTIVE = 'activo',
  INACTIVE = 'inactivo',
}

@Entity()
export class Bot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  name: string; // Nombre del bot

  @Column({ type: 'varchar', length: 300, nullable: true })
  description?: string; // Descripción enriquecida

  @Column({ length: 20 })
  language: string; // Español, Inglés, etc.

  @Column({ type: 'uuid', nullable: true })
  segmentationId?: string; // FK a la segmentación (Azure WI 1732)

  @Column({
    type: 'enum',
    enum: BotStatus,
    default: BotStatus.ACTIVE,
  })
  status: BotStatus; // Activo / Inactivo

  @Column('text', { nullable: true })
  initialPrompts?: string; // Prompts iniciales

  @Column({ nullable: true })
  avatarUrl?: string; // Ruta o URL al JPG/PNG subido

  @Column({ type: 'int', default: 0 })
  idleTimeout: number; // Minutos de inactividad

  @Column('simple-array', { nullable: true })
  closingKeywords?: string[]; // Palabras clave separadas por coma

  @Column('text', { nullable: true })
  defaultNotFoundMessage?: string; // Mensaje cuando no hay contenido

  @Column('text', { nullable: true })
  defaultOutOfScopeMessage?: string; // Mensaje fuera de alcance

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
