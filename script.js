// Pool Construction Calculator Logic

class PoolCalculator {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 5;
        this.pricing = {
            basePrice: 0,
            sizeMultiplier: 1,
            features: 0,
            siteConditions: 0,
            services: 0
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateProgressBar();
        this.updateNavigationButtons();
    }

    setupEventListeners() {
        // Next button
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.validateCurrentStep()) {
                this.nextStep();
            }
        });

        // Previous button
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.previousStep();
        });

        // Radio button changes
        document.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.calculatePrice();
            });
        });

        // Checkbox changes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.calculatePrice();
            });
        });

        // Prevent form submission
        document.getElementById('poolCalculator').addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.step[data-step="${this.currentStep}"]`);
        
        // Check for required radio buttons
        const requiredRadios = currentStepElement.querySelectorAll('input[type="radio"][name]');
        if (requiredRadios.length > 0) {
            const radioGroups = {};
            requiredRadios.forEach(radio => {
                const name = radio.name;
                if (!radioGroups[name]) {
                    radioGroups[name] = [];
                }
                radioGroups[name].push(radio);
            });

            for (const groupName in radioGroups) {
                const group = radioGroups[groupName];
                const isChecked = group.some(radio => radio.checked);
                if (!isChecked) {
                    this.showError(`Please select a ${this.getStepName(this.currentStep)} option`);
                    return false;
                }
            }
        }

        return true;
    }

    getStepName(step) {
        const names = {
            1: 'pool model',
            2: 'pool size',
            3: 'pool features',
            4: 'site condition',
            5: 'service'
        };
        return names[step] || 'option';
    }

    showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background: #ffebee;
                color: #c62828;
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 20px;
                border-left: 4px solid #c62828;
                animation: slideIn 0.3s ease-out;
            `;
            const currentStepElement = document.querySelector(`.step[data-step="${this.currentStep}"]`);
            currentStepElement.insertBefore(errorDiv, currentStepElement.firstChild);
        }
        errorDiv.textContent = message;
        
        // Remove error after 3 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => errorDiv.remove(), 300);
            }
        }, 3000);
    }

    nextStep() {
        if (this.currentStep < this.totalSteps) {
            this.hideStep(this.currentStep);
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgressBar();
            this.updateNavigationButtons();
            this.calculatePrice();
        } else {
            // Move to results
            this.calculateFinalPrice();
            this.showResults();
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.hideStep(this.currentStep);
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgressBar();
            this.updateNavigationButtons();
        }
    }

    showStep(step) {
        const stepElement = document.querySelector(`.step[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.add('active');
        }
    }

    hideStep(step) {
        const stepElement = document.querySelector(`.step[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.remove('active');
        }
    }

    updateProgressBar() {
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            if (stepNumber < this.currentStep) {
                step.classList.add('completed');
                step.classList.remove('active');
            } else if (stepNumber === this.currentStep) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');

        // Show/hide previous button
        if (this.currentStep > 1) {
            prevBtn.style.display = 'block';
        } else {
            prevBtn.style.display = 'none';
        }

        // Update next button text
        if (this.currentStep === this.totalSteps) {
            nextBtn.textContent = 'Get Estimate';
        } else {
            nextBtn.textContent = 'Next';
        }
    }

    calculatePrice() {
        // Reset pricing
        this.pricing = {
            basePrice: 0,
            sizeMultiplier: 1,
            features: 0,
            siteConditions: 0,
            services: 0
        };

        // Get base price from pool model
        const poolModel = document.querySelector('input[name="poolModel"]:checked');
        if (poolModel) {
            this.pricing.basePrice = parseFloat(poolModel.dataset.basePrice) || 0;
        }

        // Get size multiplier
        const poolSize = document.querySelector('input[name="poolSize"]:checked');
        if (poolSize) {
            this.pricing.sizeMultiplier = parseFloat(poolSize.dataset.multiplier) || 1;
        }

        // Calculate features
        const features = document.querySelectorAll('input[name="features"]:checked');
        features.forEach(feature => {
            this.pricing.features += parseFloat(feature.dataset.price) || 0;
        });

        // Calculate site conditions
        const access = document.querySelector('input[name="access"]:checked');
        if (access) {
            this.pricing.siteConditions += parseFloat(access.dataset.price) || 0;
        }

        const soil = document.querySelector('input[name="soil"]:checked');
        if (soil) {
            this.pricing.siteConditions += parseFloat(soil.dataset.price) || 0;
        }

        const slope = document.querySelector('input[name="slope"]:checked');
        if (slope) {
            this.pricing.siteConditions += parseFloat(slope.dataset.price) || 0;
        }

        // Calculate services
        const services = document.querySelectorAll('input[name="services"]:checked');
        services.forEach(service => {
            this.pricing.services += parseFloat(service.dataset.price) || 0;
        });
    }

    calculateFinalPrice() {
        this.calculatePrice();

        // Base calculation: (basePrice * sizeMultiplier) + features + siteConditions + services
        const baseCost = this.pricing.basePrice * this.pricing.sizeMultiplier;
        const totalCost = baseCost + this.pricing.features + this.pricing.siteConditions + this.pricing.services;

        // Add standard services (excavation, basic electrical, etc.)
        const standardServices = {
            excavation: baseCost * 0.15, // 15% of base cost
            basicElectrical: 2500,
            permits: 1500,
            basicPlumbing: 3000
        };

        const standardServicesTotal = Object.values(standardServices).reduce((sum, val) => sum + val, 0);

        const finalTotal = totalCost + standardServicesTotal;

        // Calculate range (±10% variance)
        const lowEstimate = Math.round(finalTotal * 0.9);
        const highEstimate = Math.round(finalTotal * 1.1);

        return {
            lowEstimate,
            highEstimate,
            breakdown: {
                basePool: Math.round(baseCost),
                features: Math.round(this.pricing.features),
                siteConditions: Math.round(this.pricing.siteConditions),
                services: Math.round(this.pricing.services),
                standardServices: Math.round(standardServicesTotal),
                total: Math.round(finalTotal)
            }
        };
    }

    showResults() {
        // Hide current step
        this.hideStep(this.currentStep);

        // Show results step
        const resultsStep = document.querySelector('.results-step');
        resultsStep.classList.add('active');

        // Calculate and display results
        const results = this.calculateFinalPrice();

        // Update estimate amounts
        document.getElementById('lowEstimate').textContent = this.formatNumber(results.lowEstimate);
        document.getElementById('highEstimate').textContent = this.formatNumber(results.highEstimate);

        // Update breakdown
        const breakdownList = document.getElementById('costBreakdown');
        breakdownList.innerHTML = '';

        const breakdownItems = [
            { label: 'Base Pool', value: results.breakdown.basePool },
            { label: 'Pool Features', value: results.breakdown.features },
            { label: 'Site Preparation', value: results.breakdown.siteConditions },
            { label: 'Upgrades & Services', value: results.breakdown.services },
            { label: 'Standard Services (Excavation, Electrical, Permits)', value: results.breakdown.standardServices }
        ];

        breakdownItems.forEach(item => {
            if (item.value > 0) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'breakdown-item';
                itemDiv.innerHTML = `
                    <span class="breakdown-item-label">${item.label}</span>
                    <span class="breakdown-item-price">$${this.formatNumber(item.value)}</span>
                `;
                breakdownList.appendChild(itemDiv);
            }
        });

        // Hide navigation buttons
        document.querySelector('.form-navigation').style.display = 'none';

        // Update progress bar to show completion
        this.currentStep = 6;
        this.updateProgressBar();
    }

    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PoolCalculator();
});

// Add fadeOut animation for error messages
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

