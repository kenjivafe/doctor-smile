import { Link, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Clock, Bell, Stethoscope, CreditCard, CalendarCheck, Sparkles, Shield, Heart, Phone, Mail, MapPin } from 'lucide-react';

export default function Welcome() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            <Head title="Home" />
            {/* Navigation */}
            <nav className="fixed top-0 right-0 left-0 z-50 border-b border-gray-200 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 dark:border-gray-800">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <Link href="/">
                                <span className="text-2xl font-black text-primary">
                                    {"DOCTOR "}
                                </span>
                                <span className="text-2xl font-black text-secondary">
                                    SMILE
                                </span>
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link href={route('login')} className="px-2 text-sm font-semibold leading-6 transition-colors text-foreground hover:text-secondary">
                                Sign in
                            </Link>
                            <Link href={route('register')}>
                                <Button className="bg-primary hover:bg-primary/90">Get Started</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="text-center">
                        <motion.h1
                            className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            Transform Your Smile Today
                        </motion.h1>
                        <motion.p
                            className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            Experience modern dentistry with state-of-the-art facilities and expert care.
                            Book appointments easily, manage your dental health, and get the smile you deserve.
                        </motion.p>
                        <motion.div
                            className="flex gap-x-6 justify-center items-center mt-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Link href={route('register')}>
                                <Button size="lg" className="rounded-md bg-primary hover:bg-primary/90">
                                    Book Your Visit
                                </Button>
                            </Link>
                            <Link href="#services" className="text-sm font-semibold leading-6 transition-colors text-foreground hover:text-secondary">
                                View Services <span aria-hidden="true">→</span>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Features Grid */}
                    <motion.div
                        className="grid grid-cols-1 gap-8 mt-32 sm:grid-cols-2 lg:grid-cols-3"
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        {[
                            {
                                title: 'Easy Scheduling',
                                description: 'Book and manage appointments with our intuitive online system',
                                icon: Calendar
                            },
                            {
                                title: 'Expert Dental Care',
                                description: 'Professional dentists using advanced technology for your care',
                                icon: Stethoscope
                            },
                            {
                                title: 'Smart Reminders',
                                description: 'Get timely notifications for appointments and follow-ups',
                                icon: Bell
                            },
                            {
                                title: 'Flexible Hours',
                                description: 'Extended operating hours to fit your busy schedule',
                                icon: Clock
                            },
                            {
                                title: 'Online Payments',
                                description: 'Secure and convenient payment options with Stripe',
                                icon: CreditCard
                            },
                            {
                                title: 'Calendar Sync',
                                description: 'Sync appointments with your Google Calendar',
                                icon: CalendarCheck
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="overflow-hidden relative p-8 bg-gradient-to-b from-gray-50 to-white rounded-3xl border border-gray-200 transition-colors duration-300 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800 hover:border-secondary/50"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 * index }}
                                // whileHover={{ y: -5 }}
                            >
                                <div className="inline-block p-2 mb-4 rounded-xl bg-primary/10">
                                    <feature.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 text-gray-600 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Services Section */}
                    <div id="services" className="pt-20 mt-12 text-center scroll-mt-24">
                        <motion.h2
                            className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            Our Services
                        </motion.h2>
                        <motion.p
                            className="mt-4 text-lg text-muted-foreground"
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                        >
                            Comprehensive dental care for your entire family
                        </motion.p>

                        <div className="grid grid-cols-1 gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-3">
                            {[
                                {
                                    title: 'General Dentistry',
                                    description: 'Regular check-ups, cleanings, and preventive care',
                                    icon: Heart,
                                    features: ['Dental Check-ups', 'Teeth Cleaning', 'Cavity Prevention']
                                },
                                {
                                    title: 'Cosmetic Dentistry',
                                    description: 'Transform your smile with our aesthetic treatments',
                                    icon: Sparkles,
                                    features: ['Teeth Whitening', 'Veneers', 'Smile Makeover']
                                },
                                {
                                    title: 'Dental Care',
                                    description: 'Basic and advanced treatments for optimal oral health',
                                    icon: Shield,
                                    features: ['Root Canal', 'Dental Implants', 'Orthodontics']
                                }
                            ].map((service, index) => (
                                <motion.div
                                    key={index}
                                    className="relative group"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                >
                                    <div className="overflow-hidden relative p-8 bg-gradient-to-b rounded-3xl border transition-all duration-300 border-border from-background to-card hover:border-secondary/50 group-hover:shadow-lg group-hover:shadow-secondary/5 dark:border-gray-800 dark:from-gray-900 dark:to-gray-800">
                                        <div className="inline-block p-3 mb-4 rounded-xl transition-colors bg-primary/10 group-hover:bg-secondary/20">
                                            <service.icon className="w-8 h-8 transition-colors text-primary group-hover:text-secondary" />
                                        </div>
                                        <h3 className="mb-4 text-xl font-semibold text-foreground">
                                            {service.title}
                                        </h3>
                                        <p className="mb-6 text-muted-foreground">
                                            {service.description}
                                        </p>
                                        <ul className="space-y-2">
                                            {service.features.map((feature, i) => (
                                                <li key={i} className="flex items-center text-sm text-muted-foreground">
                                                    <span className="mr-2 text-primary">•</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <motion.div
                        className="mt-32 text-center"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="isolate overflow-hidden relative px-6 py-16 bg-gradient-to-br rounded-3xl shadow-2xl from-primary/90 via-secondary/90 to-primary/90 dark:from-primary/10 dark:via-secondary/20 dark:to-primary/10 sm:py-24 sm:px-24">
                            <div className="mx-auto mb-12 max-w-3xl text-center">
                                <h2 className="text-3xl font-bold tracking-tight text-background sm:text-4xl dark:text-foreground">
                                    Ready to Transform Your Smile?
                                </h2>
                                <p className="mx-auto mt-6 text-lg leading-8 text-background/90 dark:text-foreground/90">
                                    Book your appointment today and take the first step towards a brighter, healthier smile.
                                </p>
                            </div>

                            <div className="mx-auto max-w-5xl">
                                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="space-y-6">
                                            <h3 className="text-2xl font-semibold text-background dark:text-foreground">Contact Us</h3>
                                            <div className="space-y-4">
                                                <motion.a
                                                    href="tel:09177408417"
                                                    className="flex items-center p-4 rounded-xl transition-colors bg-white/5 hover:bg-white/10 group"
                                                    initial={{ opacity: 0 }}
                                                    whileInView={{ opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.2 }}
                                                >
                                                    <div className="p-2 rounded-lg transition-colors bg-background/10 group-hover:bg-background/20 dark:bg-foreground/10">
                                                        <Phone className="w-6 h-6 text-background dark:text-foreground" />
                                                    </div>
                                                    <div className="flex-1 ml-4 text-left">
                                                        <p className="font-medium text-background dark:text-foreground">Contact Us</p>
                                                        <p className="text-background/80 dark:text-foreground/80">0917 740 8417</p>
                                                        <p className="text-sm text-background/60 dark:text-foreground/60">Available during clinic hours</p>
                                                    </div>
                                                </motion.a>
                                                <motion.a
                                                    href="mailto:contact@doctorsmile.com"
                                                    className="flex items-center p-4 rounded-xl transition-colors bg-white/5 hover:bg-white/10 group"
                                                    initial={{ opacity: 0 }}
                                                    whileInView={{ opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <div className="p-2 rounded-lg transition-colors bg-background/10 group-hover:bg-background/20 dark:bg-foreground/10">
                                                        <Mail className="w-6 h-6 text-background dark:text-foreground" />
                                                    </div>
                                                    <div className="flex-1 ml-4 text-left">
                                                        <p className="font-medium text-background dark:text-foreground">Email Inquiries</p>
                                                        <p className="text-background/80 dark:text-foreground/80">contact@doctorsmile.com</p>
                                                        <p className="text-sm text-background/60 dark:text-foreground/60">Response within 24 hours</p>
                                                    </div>
                                                </motion.a>
                                                <motion.div
                                                    className="flex items-center p-4 rounded-xl bg-white/5"
                                                    initial={{ opacity: 0 }}
                                                    whileInView={{ opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.4 }}
                                                >
                                                    <div className="p-2 rounded-lg bg-background/10 dark:bg-foreground/10">
                                                        <Clock className="w-6 h-6 text-background dark:text-foreground" />
                                                    </div>
                                                    <div className="flex-1 ml-4 text-left">
                                                        <p className="font-medium text-background dark:text-foreground">Clinic Hours</p>
                                                        <p className="text-background/80 dark:text-foreground/80">Mon-Fri: 9:00 AM - 4:00 PM</p>
                                                        <p className="text-sm text-background/60 dark:text-foreground/60">Walk-ins welcome during clinic hours</p>
                                                    </div>
                                                </motion.div>
                                                <motion.div
                                                    className="flex flex-col justify-center items-center p-4 rounded-xl bg-white/5"
                                                    initial={{ opacity: 0 }}
                                                    whileInView={{ opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.5 }}
                                                >
                                                    <Link href={route('register')} className="w-full">
                                                        <Button
                                                            size="lg"
                                                            className="w-full font-semibold transition-colors text-md bg-background hover:bg-background/90 text-primary hover:text-secondary dark:bg-primary/20 dark:hover:bg-primary/30 dark:text-foreground"
                                                        >
                                                            <Calendar className="mr-2 w-6 h-6"/>
                                                            Schedule Appointment
                                                        </Button>
                                                    </Link>
                                                    <p className="mt-2 text-sm text-background/60 dark:text-foreground/60">Quick online booking available 24/7</p>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <div className="space-y-6">
                                            <h3 className="text-2xl font-semibold text-background dark:text-foreground">Location</h3>
                                            <div className="space-y-4">

                                                <motion.div
                                                    className="p-4 rounded-xl bg-white/5"
                                                    initial={{ opacity: 0 }}
                                                    whileInView={{ opacity: 1 }}
                                                    viewport={{ once: true }}
                                                    transition={{ delay: 0.3 }}
                                                >
                                                    <div className="aspect-[4/3] w-full rounded-lg overflow-hidden bg-background/10 shadow-lg">
                                                        <iframe
                                                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d799.4200306072125!2d121.72532549711694!3d17.616787536877926!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x338585e11e5d547b%3A0xf5cc34674de88b1!2sDoctor%20Smile%20Dental%20Center!5e0!3m2!1sen!2sph!4v1742373847669!5m2!1sen!2sph"
                                                            width="100%"
                                                            height="100%"
                                                            style={{ border: 0 }}
                                                            allowFullScreen
                                                            loading="lazy"
                                                            referrerPolicy="no-referrer-when-downgrade"
                                                            title="Doctor Smile Dental Center Location Map"
                                                            aria-label="Interactive map showing the location of Doctor Smile Dental Center"
                                                        />
                                                    </div>
                                                    <div className="flex items-center pt-4 pb-1">
                                                        <div className="p-2 rounded-lg bg-background/10 dark:bg-foreground/10">
                                                            <MapPin className="w-6 h-6 text-background dark:text-foreground" />
                                                        </div>
                                                        <div className="flex-1 ml-4 text-left">
                                                            <p className="font-medium text-background dark:text-foreground">Doctor Smile Dental Center</p>
                                                            <p className="text-background/80 dark:text-foreground/80">5 Legazpi Street, Ugac Norte, Tuguegarao City</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Background Elements */}
                <div className="overflow-hidden absolute inset-0 -z-10">
                    <div className="absolute left-[50%] top-0 h-[1000px] w-[1000px] -translate-x-1/2 bg-gradient-to-tr from-primary/20 via-secondary/20 to-primary/20 opacity-30 blur-3xl" />
                    <div className="absolute right-[25%] top-[50%] h-[800px] w-[800px] bg-gradient-to-tr from-secondary/20 via-primary/20 to-secondary/20 opacity-30 blur-3xl" />
                </div>
            </div>
        </div>
    );
}