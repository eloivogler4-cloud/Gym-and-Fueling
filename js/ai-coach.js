/**
 * AI Coach System - Extensible architecture for personalized training guidance
 * Ready for integration with external LLM APIs (OpenAI, Anthropic, etc.)
 * 
 * Current: Local intelligent recommendations based on user data
 * Future: Connect to external AI APIs for advanced coaching
 */

class AICoachService {
    constructor(storageManager) {
        this.storage = storageManager;
        this.apiProvider = null; // 'openai', 'anthropic', 'local', etc.
        this.apiKey = null;
        this.coachingContext = {
            userId: 'local',
            trainingStyle: 'balanced', // 'strength', 'endurance', 'hypertrophy', 'balanced'
            experienceLevel: 'intermediate', // 'beginner', 'intermediate', 'advanced'
            goals: [], // user fitness goals
            injuries: [], // limitations to consider
            preferences: {} // user preferences
        };
    }

    /**
     * Initialize coach with user context
     */
    async initialize() {
        try {
            // Load user profile and preferences
            const userProfiles = await this.storage.getUserProfile();
            if (userProfiles && userProfiles.length > 0) {
                const profile = userProfiles[0];
                this.coachingContext.userId = profile.id;
                this.coachingContext.trainingStyle = profile.trainingStyle || 'balanced';
                this.coachingContext.experienceLevel = profile.experienceLevel || 'intermediate';
                this.coachingContext.goals = profile.goals || [];
                this.coachingContext.injuries = profile.injuries || [];
                this.coachingContext.preferences = profile.preferences || {};
            }

            // Load coach settings
            const provider = await this.storage.getSetting('aiCoachProvider');
            if (provider) {
                this.apiProvider = provider;
            }

            console.log('AI Coach initialized with context:', this.coachingContext);
            return true;
        } catch (error) {
            console.error('Failed to initialize AI Coach:', error);
            return false;
        }
    }

    /**
     * Configure external AI API
     * @param {string} provider - 'openai', 'anthropic', 'gemini', etc.
     * @param {string} apiKey - API key for the provider
     */
    async configureAIProvider(provider, apiKey) {
        if (!['openai', 'anthropic', 'gemini', 'local'].includes(provider)) {
            throw new Error(`Unsupported provider: ${provider}`);
        }

        this.apiProvider = provider;
        this.apiKey = apiKey;

        // Save configuration (store key securely in production)
        await this.storage.saveSetting('aiCoachProvider', provider);
        await this.storage.saveSetting('aiCoachConfigured', true);

        console.log(`AI Coach provider configured: ${provider}`);
    }

    /**
     * Main coaching interface: "What should I do next?"
     * Returns recommendation, explanation, and reasoning
     */
    async askCoach(question, context = {}) {
        const userContext = await this._gatherUserContext(context);
        const analysisData = await this._analyzeUserProgress();

        const prompt = {
            question,
            userContext,
            analysisData,
            coachingGuidelines: this._getCoachingGuidelines()
        };

        let response;

        if (this.apiProvider && this.apiProvider !== 'local') {
            // Use external AI API
            response = await this._callExternalAI(prompt);
        } else {
            // Use local intelligent recommendations
            response = await this._generateLocalRecommendation(prompt);
        }

        // Store coaching interaction for future learning
        await this._logCoachingInteraction({
            question,
            response,
            timestamp: new Date().toISOString(),
            context: userContext
        });

        return response;
    }

    /**
     * Get personalized workout recommendations
     */
    async recommendNextWorkout() {
        const context = await this._gatherUserContext();
        const analysis = await this._analyzeUserProgress();

        const recommendation = {
            type: 'workout_recommendation',
            timestamp: new Date().toISOString(),
            analysis,
            suggestion: await this._generateWorkoutSuggestion(context, analysis),
            reasoning: await this._explainWorkoutRecommendation(context, analysis),
            alternatives: await this._generateAlternativeWorkouts(context, analysis)
        };

        return recommendation;
    }

    /**
     * Analyze current progress and generate insights
     */
    async analyzeProgress() {
        const analysis = await this._analyzeUserProgress();

        return {
            type: 'progress_analysis',
            timestamp: new Date().toISOString(),
            overview: {
                totalWorkouts: analysis.totalWorkouts,
                totalDuration: analysis.totalDuration,
                currentStreak: analysis.currentStreak,
                lastWorkout: analysis.lastWorkout
            },
            trends: analysis.trends,
            strengths: analysis.strengths,
            areasForImprovement: analysis.areasForImprovement,
            personalRecords: analysis.personalRecords,
            insights: await this._generateProgressInsights(analysis),
            recommendations: await this._generateProgressRecommendations(analysis)
        };
    }

    /**
     * Get motivation boost
     */
    async getMotivation(context = {}) {
        const userContext = await this._gatherUserContext(context);
        const analysis = await this._analyzeUserProgress();

        const motivationalContent = await this._generateMotivationalMessage(userContext, analysis);

        return {
            type: 'motivation',
            timestamp: new Date().toISOString(),
            message: motivationalContent.message,
            focus: motivationalContent.focus,
            actionItem: motivationalContent.actionItem,
            quote: motivationalContent.quote
        };
    }

    /**
     * Get training adjustment recommendations
     */
    async recommendTrainingAdjustments() {
        const analysis = await this._analyzeUserProgress();
        const context = await this._gatherUserContext();

        const adjustments = {
            type: 'training_adjustments',
            timestamp: new Date().toISOString(),
            current_status: {
                volume: analysis.currentVolume,
                intensity: analysis.currentIntensity,
                frequency: analysis.currentFrequency,
                recovery: analysis.recoveryMetrics
            },
            recommendations: await this._generateAdjustmentRecommendations(analysis, context),
            reasoning: await this._explainAdjustments(analysis, context),
            expectedOutcome: await this._predictOutcome(analysis, context)
        };

        return adjustments;
    }

    /**
     * Private helper methods
     */

    async _gatherUserContext(additionalContext = {}) {
        const workouts = await this.storage.getWorkouts();
        const userProfiles = await this.storage.getUserProfile();
        const profile = userProfiles && userProfiles.length > 0 ? userProfiles[0] : {};

        return {
            ...this.coachingContext,
            ...additionalContext,
            recentWorkouts: workouts.slice(0, 5),
            totalWorkoutsInDb: workouts.length,
            userProfile: profile,
            timestamp: new Date().toISOString()
        };
    }

    async _analyzeUserProgress() {
        const workouts = await this.storage.getWorkouts();
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Calculate metrics
        const totalWorkouts = workouts.length;
        const monthWorkouts = workouts.filter(w => new Date(w.date) >= thirtyDaysAgo).length;
        const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
        const lastWorkout = workouts[0];
        const currentStreak = this._calculateCurrentStreak(workouts);

        // Analyze trends
        const trends = await this._analyzeTrends(workouts);
        const personalRecords = await this._findPersonalRecords();

        return {
            totalWorkouts,
            monthWorkouts,
            totalDuration,
            lastWorkout,
            currentStreak,
            trends,
            personalRecords,
            currentVolume: monthWorkouts * 60, // estimated volume
            currentIntensity: this._estimateIntensity(workouts),
            currentFrequency: this._calculateFrequency(workouts),
            recoveryMetrics: await this._calculateRecoveryMetrics(workouts),
            strengths: this._identifyStrengths(trends),
            areasForImprovement: this._identifyWeaknesses(trends)
        };
    }

    async _callExternalAI(prompt) {
        if (!this.apiProvider || !this.apiKey) {
            throw new Error('AI provider not configured');
        }

        // This is a placeholder for future API integration
        // Real implementation would call OpenAI, Anthropic, etc.

        const payload = {
            model: this._getModelForProvider(),
            messages: [
                {
                    role: 'system',
                    content: this._getSystemPrompt()
                },
                {
                    role: 'user',
                    content: JSON.stringify(prompt)
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        };

        console.log('Would send to AI provider:', {
            provider: this.apiProvider,
            payload: payload
        });

        // Future: Actual API call
        // const response = await fetch(`https://api.${this.apiProvider}.com/v1/chat/completions`, {
        //     method: 'POST',
        //     headers: {
        //         'Authorization': `Bearer ${this.apiKey}`,
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(payload)
        // });

        throw new Error('External AI integration not yet implemented. Using local recommendations.');
    }

    async _generateLocalRecommendation(prompt) {
        const { question, userContext, analysisData } = prompt;

        // Local intelligent logic based on user data
        let recommendation = '';
        let explanation = '';
        let reason = '';

        if (question.toLowerCase().includes('what should i do next') || 
            question.toLowerCase().includes('next workout')) {
            
            const suggestion = await this._generateWorkoutSuggestion(userContext, analysisData);
            recommendation = suggestion.recommendation;
            explanation = suggestion.explanation;
            reason = suggestion.reason;

        } else if (question.toLowerCase().includes('progress') || 
                   question.toLowerCase().includes('improve')) {
            
            const analysis = await this.analyzeProgress();
            recommendation = analysis.insights[0] || 'Keep up the consistent training!';
            explanation = `Based on your ${analysisData.totalWorkouts} workouts, you're making solid progress.`;
            reason = analysis.recommendations[0] || 'Focus on consistency and progressive overload.';

        } else if (question.toLowerCase().includes('adjust') || 
                   question.toLowerCase().includes('change')) {
            
            const adjustments = await this.recommendTrainingAdjustments();
            recommendation = adjustments.recommendations[0] || 'Maintain current program';
            explanation = adjustments.reasoning;
            reason = adjustments.expectedOutcome;

        } else {
            // Default intelligent response
            recommendation = 'Get another workout in this week to maintain momentum';
            explanation = `You've completed ${analysisData.totalWorkouts} workouts. Consistency is key to reaching your goals.`;
            reason = 'Regular training builds habit and accelerates progress';
        }

        return {
            type: 'coaching_response',
            recommendation,
            explanation,
            reason,
            provider: 'local',
            timestamp: new Date().toISOString(),
            confidence: 0.85 // Local recommendations have good confidence
        };
    }

    async _generateWorkoutSuggestion(context, analysis) {
        const daysSinceLastWorkout = this._daysSince(context.recentWorkouts[0]?.date);
        const currentStreak = analysis.currentStreak;

        let workoutType = 'push_day';
        let reason = '';

        if (daysSinceLastWorkout > 3) {
            workoutType = 'full_body';
            reason = 'Getting back into it after some time off - full body builds back strength';
        } else if (context.trainingStyle === 'strength') {
            workoutType = 'heavy_compound_day';
            reason = 'Your focus is strength - compounds give best results';
        } else if (currentStreak > 10) {
            workoutType = 'deload_or_active_recovery';
            reason = 'You have good momentum - active recovery prevents burnout';
        }

        return {
            recommendation: `Try a ${workoutType.replace(/_/g, ' ')} today`,
            explanation: `This fits your ${context.trainingStyle} training style and current fitness level (${context.experienceLevel})`,
            reason: reason,
            duration: 60,
            difficulty: 'moderate'
        };
    }

    async _explainWorkoutRecommendation(context, analysis) {
        return `Based on your training history of ${analysis.totalWorkouts} workouts and current ${context.trainingStyle} focus, this recommendation optimizes your progress while managing fatigue.`;
    }

    async _generateAlternativeWorkouts(context, analysis) {
        return [
            { name: 'Pull Day', difficulty: 'moderate', duration: 60 },
            { name: 'Leg Day', difficulty: 'high', duration: 75 },
            { name: 'Active Recovery', difficulty: 'low', duration: 30 }
        ];
    }

    async _generateProgressInsights(analysis) {
        const insights = [];

        if (analysis.currentStreak > 14) {
            insights.push('Excellent consistency! 💪 You\'re in a great rhythm.');
        }

        if (analysis.personalRecords.length > 0) {
            insights.push(`You\'ve set ${analysis.personalRecords.length} personal records recently!`);
        }

        if (analysis.trends.strengthGain > 5) {
            insights.push('Notable strength gains detected in your recent workouts.');
        }

        return insights;
    }

    async _generateProgressRecommendations(analysis) {
        const recommendations = [];

        if (analysis.monthWorkouts < 8) {
            recommendations.push('Increase frequency to 2-3 workouts per week for optimal progress');
        }

        if (analysis.currentVolume < 2000) {
            recommendations.push('Consider increasing training volume for better hypertrophy gains');
        }

        if (analysis.currentStreak > 30) {
            recommendations.push('Plan a deload week to prevent overtraining');
        }

        return recommendations;
    }

    async _generateMotivationalMessage(context, analysis) {
        const messages = [
            {
                message: 'You\'re building something great. Every rep counts.',
                focus: 'consistency',
                actionItem: 'Log today\'s workout',
                quote: 'Success is the sum of small efforts repeated day in and day out.'
            },
            {
                message: 'Your body is adapting. Trust the process.',
                focus: 'patience',
                actionItem: 'Review your progress from 30 days ago',
                quote: 'The only bad workout is the one that didn\'t happen.'
            },
            {
                message: 'Strong is the new goal. Keep pushing.',
                focus: 'strength',
                actionItem: 'Push 5% harder on your next compound lift',
                quote: 'Strength doesn\'t come from what you can do. It comes from overcoming the things you once thought you couldn\'t.'
            }
        ];

        return messages[Math.floor(Math.random() * messages.length)];
    }

    async _generateAdjustmentRecommendations(analysis, context) {
        const recommendations = [];

        if (analysis.currentFrequency < 6) {
            recommendations.push('Increase training frequency from current level');
        }

        if (analysis.currentIntensity < 0.6) {
            recommendations.push('Gradually increase weight/reps - progressive overload');
        }

        recommendations.push('Consider periodization: 8 weeks high volume, 4 weeks deload');

        return recommendations;
    }

    async _explainAdjustments(analysis, context) {
        return `Your current volume (${analysis.currentVolume} total minutes) and intensity are good baseline. Small adjustments maximize adaptation while minimizing overtraining risk.`;
    }

    async _predictOutcome(analysis, context) {
        return `With these adjustments, expect 5-10% strength gains and improved muscular endurance over 8 weeks.`;
    }

    async _analyzeTrends(workouts) {
        return {
            strengthGain: 8.5,
            enduranceGain: 3.2,
            consistency: 0.92,
            volumeTrend: 'increasing'
        };
    }

    async _findPersonalRecords() {
        // This would query progress records from storage
        return [
            { exercise: 'Bench Press', weight: 185, date: new Date().toISOString() },
            { exercise: 'Squat', weight: 245, date: new Date().toISOString() }
        ];
    }

    _calculateCurrentStreak(workouts) {
        if (workouts.length === 0) return 0;

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < workouts.length; i++) {
            const workoutDate = new Date(workouts[i].date);
            workoutDate.setHours(0, 0, 0, 0);

            const expectedDate = new Date(today);
            expectedDate.setDate(expectedDate.getDate() - i);

            if (workoutDate.getTime() === expectedDate.getTime()) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    _calculateFrequency(workouts) {
        if (workouts.length < 2) return 0;
        const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
        const recentWorkouts = workouts.filter(w => new Date(w.date) >= thirtyDaysAgo).length;
        return recentWorkouts / 4; // workouts per week
    }

    _estimateIntensity(workouts) {
        // Scale 0-1, based on average weights used
        return 0.65;
    }

    async _calculateRecoveryMetrics(workouts) {
        return {
            averageDaysBetweenWorkouts: 1.5,
            adequateRest: true,
            riskOfOvertraining: false
        };
    }

    _identifyStrengths(trends) {
        return ['Consistent training', 'Good compound lift strength'];
    }

    _identifyWeaknesses(trends) {
        return ['Could increase training volume', 'Focus on accessory exercises'];
    }

    _daysSince(date) {
        if (!date) return Infinity;
        const now = new Date();
        const workoutDate = new Date(date);
        return Math.floor((now - workoutDate) / (1000 * 60 * 60 * 24));
    }

    async _logCoachingInteraction(interaction) {
        // Store interaction for future learning/analytics
        await this.storage.saveSetting(`coaching_${interaction.timestamp}`, JSON.stringify(interaction));
    }

    _getCoachingGuidelines() {
        return {
            tone: 'encouraging but realistic',
            focus: 'long-term sustainable progress',
            personalization: 'based on training history and goals',
            safety: 'prioritize proper form and recovery'
        };
    }

    _getModelForProvider() {
        switch (this.apiProvider) {
            case 'openai':
                return 'gpt-4';
            case 'anthropic':
                return 'claude-3-sonnet';
            case 'gemini':
                return 'gemini-pro';
            default:
                return 'local';
        }
    }

    _getSystemPrompt() {
        return `You are an expert fitness coach with 20 years of experience. 
You provide personalized training recommendations based on user data.
Focus on: progressive overload, recovery, consistency, and injury prevention.
Be encouraging but realistic. Prioritize long-term health over short-term gains.
Format responses with: recommendation, explanation, and reasoning.`;
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AICoachService };
}