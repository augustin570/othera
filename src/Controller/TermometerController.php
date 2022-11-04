<?php

namespace App\Controller;

use App\Entity\Termometer;
use App\Form\TermometerType;
use App\Repository\TermometerRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/termometer')]
class TermometerController extends AbstractController
{
    #[Route('/', name: 'termometer.index', methods: ['GET'])]
    public function index(TermometerRepository $termometerRepository): JsonResponse
    {
        return new JsonResponse( [
            'status' => 0,
            'termometers' => $termometerRepository->findByLast( ( new \DateTime() )->modify( '-6 hours' ) ),
        ] );
    }

    #[Route('/new', name: 'termometer.new', methods: ['GET', 'POST'])]
    public function new(Request $request, TermometerRepository $termometerRepository): JsonResponse
    {
        $termometer = new Termometer();
        $form = $this->createForm(TermometerType::class, $termometer);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $termometerRepository->save($termometer, true);

            return new JsonResponse( [
                'status' => 0
            ] );
        }

        return new JsonResponse( [
            'status' => 1,
        ] );
    }

    #[Route('/{id}', name: 'termometer.show', methods: ['GET'])]
    public function show(Termometer $termometer): JsonResponse
    {
        return new JsonResponse( [
            'status' => 0,
            'termometer' => $termometer,
        ] );
    }

    #[Route('/{id}/edit', name: 'termometer.edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Termometer $termometer, TermometerRepository $termometerRepository): JsonResponse
    {
        $form = $this->createForm(TermometerType::class, $termometer);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $termometerRepository->save($termometer, true);

            return new JsonResponse( [
                'status' => 0,
                'termometer' => $termometer,
            ] );
        }

        return new JsonResponse( [
            'status' => 1,
        ] );
    }

    #[Route('/{id}', name: 'termometer.delete', methods: ['POST'])]
    public function delete(Request $request, Termometer $termometer, TermometerRepository $termometerRepository): JsonResponse
    {
        if ($this->isCsrfTokenValid('delete'.$termometer->getId(), $request->request->get('_token'))) {
            $termometerRepository->remove($termometer, true);
            return new JsonResponse( [
                'status' => 0
            ] );
        }

        return new JsonResponse( [
            'status' => 1,
        ] );
    }
}
