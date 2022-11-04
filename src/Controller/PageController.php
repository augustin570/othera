<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PageController extends AbstractController
{
    #[Route('/', name: 'page.index')]
    public function index(): Response
    {
        return $this->render( 'page/index.html.twig', [
            'geoapify_key' => $this->getParameter( 'geoapify_key' ),
            'graphhopper_key' => $this->getParameter( 'graphhopper_key' )
        ] );
    }
}
