srccomponentsSEO.jsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, url }) {
    const siteTitle = `${title}  ShadowClips`;

    return (
        Helmet
            title{ siteTitle } title
            meta name = description content = { description }

    { Open Graph  Facebook  WhatsApp }
            meta property = ogtype content = website 
            meta property = ogurl content = { url } 
            meta property = ogtitle content = { siteTitle } 
            meta property = ogdescription content = { description }

    { Twitter }
            meta name = twittercard content = summary_large_image 
            meta name = twittertitle content = { siteTitle } 
            meta name = twitterdescription content = { description }

    { Canonical Link(Sangat penting untuk menghindari duplicate content SEO) }
            link rel = canonical href = { url }
    Helmet
    );
}