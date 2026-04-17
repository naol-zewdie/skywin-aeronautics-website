import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'career_openings' })
export class CareerOpeningEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  location: string;

  @Column()
  employmentType: string;
}
