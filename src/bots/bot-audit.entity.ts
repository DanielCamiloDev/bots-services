import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { Bot } from './bots.entity';
  
  export enum BotAuditAction {
    CREATE = 'create',
    UPDATE = 'update',
  }
  
  @Entity({ name: 'bot_audit_log' })
  export class BotAuditLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    // Relación al bot afectado
    @ManyToOne(() => Bot, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bot_id' })
    bot: Bot;
  
    @Column('uuid')
    bot_id: string;
  
    // Usuario que hizo el cambio (puede ser nombre o id de tu tabla de usuarios)
    @Column({ length: 100 })
    user: string;
  
    // Tipo de acción: creación o edición
    @Column({
      type: 'enum',
      enum: BotAuditAction,
    })
    action: BotAuditAction;
  
    // Detalles de lo modificado: texto libre o JSON serializado
    @Column({ type: 'simple-json', nullable: true })
    details?: Record<string, any>;
  
    // Timestamp automático
    @CreateDateColumn()
    createdAt: Date;
  }