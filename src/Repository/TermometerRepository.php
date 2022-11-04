<?php

namespace App\Repository;

use App\Entity\Termometer;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Termometer>
 *
 * @method Termometer|null find($id, $lockMode = null, $lockVersion = null)
 * @method Termometer|null findOneBy(array $criteria, array $orderBy = null)
 * @method Termometer[]    findAll()
 * @method Termometer[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class TermometerRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Termometer::class);
    }

    public function findByLast ( \DateTime $date ): array
    {
        return $this->createQueryBuilder('t')
           ->andWhere('t.created_at > :date')
           ->setParameter('date', $date)
           ->getQuery()
           ->getResult()
       ;
    }

    public function save(Termometer $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Termometer $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush) {
            $this->getEntityManager()->flush();
        }
    }

//    /**
//     * @return Termometer[] Returns an array of Termometer objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('t')
//            ->andWhere('t.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('t.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Termometer
//    {
//        return $this->createQueryBuilder('t')
//            ->andWhere('t.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
