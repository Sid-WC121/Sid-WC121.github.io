# Measuring Barron's Constant: Putting a 1993 Approximation Theorem on a GPU

Almost every time someone says neural networks "beat the curse of dimensionality," they're repeating folklore. It's a nice phrase, it gestures at something true, and it comes with no number you can check. But there's one result that does come with a number, and it's been sitting there since 1993. Andrew Barron proved a theorem with an honest constant in it. I wanted to know whether a network I actually train respects that constant, or whether it's one of those bounds that's technically correct and practically useless.

So I put it on a GPU and measured.

## What the theorem says

Take a function $f: \mathbb{R}^d \to \mathbb{R}$ that has a Fourier representation $f(x) = \int_{\mathbb{R}^d} \hat{f}(\omega) e^{i \langle \omega, x \rangle} d\omega$. Its Barron norm is the first moment of the Fourier magnitude:

$$
C_f = \int_{\mathbb{R}^d} \|\omega\|_1 |\hat{f}(\omega)| \, d\omega
$$

Barron showed that for any probability measure $\mu$ on a ball of radius $r$, and any width $n$, there's a single-hidden-layer network $f_n$ with

$$
\|f - f_n\|_{L^2(\mu)} \le \frac{2 C_f r}{\sqrt{n}}
$$

This is a ceiling, it tells you the error is no worse than this, for the best network of that width, in the worst case. It says nothing about the error you actually get when you sit down and train one. That gap between what the bound promises and what you actually get is the whole reason I ran this.. The rate itself has been reproved, extended into Barron spaces, dropped into PDE solvers. What I couldn't find anyone doing was computing $C_f$ exactly, training a few hundred networks, and reporting what fraction of the ceiling they actually use.

There are three things the bound lets me check. The error should fall like $1/\sqrt{n}$. Every trained network should sit under $2 C_f r / \sqrt{n}$, at every width, not just eventually. And the rate shouldn't care about $d$, which is the part that makes the theorem matter, because polynomials very much do care.

But none of that is testable without the constant, so that comes first.

## Pinning down the constant

You can't test an absolute bound with a fuzzy $C_f$. I needed it in closed form, so I picked two targets where the integral actually closes.

| Target             | $f(x)$                             | Closed-form$C_f$         | At the params I used               |
| ------------------ | ------------------------------------ | -------------------------- | ---------------------------------- |
| Isotropic Gaussian | $\exp(-\|x\|^2 / 2\sigma^2)$       | $d\sqrt{2/\pi}\,/\sigma$ | $\approx 0.798\,d$ (σ = 1)      |
| Separable sech     | $\prod_j \operatorname{sech}(x_j)$ | $d \cdot 8G/\pi^2$       | $\approx 0.742\,d$ (G = Catalan) |

The Gaussian falls out of separating coordinates after the transform. The sech one leans on Catalan's constant $G \approx 0.9160$. Both grow linearly in $d$, and that linear growth is what the dimension argument later depends on. The error scales with $C_f$, $C_f$ scales like $d$, so the network's cost grows linearly while polynomial approximation pays $O(n^{-2/d})$ and collapses.

## How I ran it

Single hidden layer, sigmoid activations, trained with L-BFGS: 20 outer steps, 100 inner. Ten thousand points drawn uniformly from the unit ball. I used L-BFGS on purpose, I wanted the optimization error driven down near zero, so that whatever gap survives is approximation and estimation error and not the optimizer giving up early. Three seeds each, mean and standard deviation reported on a held-out set of 5,000 points.

The sweep runs over widths $n \in \{8, 16, 32, \ldots, 4096\}$, dimensions $d \in \{1, 2, 5, 10, 20\}$, both targets. Three hundred configurations in total. The whole thing finishes in about five minutes on an RTX 3070 GPU.

## The rate

![Prediction 1 — approximation error vs width, log-log, for the Gaussian and sech bumps at d=5](/assets/images/blog/barron/fig1_convergence_rate.png)

At $d = 5$, both targets give a log-log slope right around $-0.50$. Gaussian lands at $-0.498$, sech at $-0.500$. That's the $1/\sqrt{n}$ prediction, essentially exact. The measured curve runs parallel to the analytic $2 C_f/\sqrt{n}$ line and stays under it the whole way. That's not surprising, the rate was always the easy prediction. The next two are where I wasn't sure what I'd see.

## Dimension, and where polynomials fall apart

![Prediction 3 — L2 error vs input dimension at fixed n=256, neural net against a degree-2 polynomial baseline](/assets/images/blog/barron/fig2_dimension_independence.png)

Fix the width at $n = 256$ and sweep $d$ from 1 to 20. The network's error rises, but slowly, and it rises linearly, tracking $C_f \propto d$ the way you'd hope. The degree-2 Ridge baseline is fine at low $d$ and then it just gives up as the dimension climbs. This is the plot I'd hand to anyone who thinks "universal approximation" and "curse of dimensionality" are somehow in tension. They aren't. The network pays for dimension through $C_f$, and for these two functions $C_f$ is cheap.

## The constant, which is the part I cared about

![Prediction 2 — error times sqrt(n) versus the closed-form Barron constant, with the ceiling and a best-fit line](/assets/images/blog/barron/fig3_barron_constant.png)

For each $(d, \text{target})$ pair I took $\text{error} \cdot \sqrt{n}$, averaged over widths and seeds, and plotted it against the closed-form $C_f$. If the theorem holds, every point lands under the ceiling $y = 2 C_f r$. Loose bound, points sit far below. Tight bound, they hug it.

All 300 land under the ceiling. The best fit through the origin has slope about $1.20$, against the theoretical $2.0$, so the realized error sits at roughly 60% of the bound. What got me is that it stays at 60%. Across every dimension, across every width. I'd expected the ratio to drift with $d$ or wobble at the small widths where things usually get ugly, and it just doesn't. The gap between that fit and the ceiling is the leftover estimation and optimization error, and since L-BFGS mops up the optimization part, most of what's left is generalization.

## What the number actually means, and what it doesn't

![Error decomposition — Barron bound, measured test error, and the polynomial baseline for both targets at d=5](/assets/images/blog/barron/fig4_error_decomposition.png)

The theorem bounds the approximation term only, but what I measure is total test error, which quietly folds in the generalization gap. So "60% of the bound" is an upper estimate on how much of the approximation budget gets spent, not a clean reading of it. Pulling the two apart means a careful train-versus-test comparison, and I haven't done that yet. It's the obvious next thing to run.

The decomposition plot shows this directly: the shaded band is budget the optimizer never needed to touch, the solid curve is measured total error, and the flat baseline down at the bottom is where the polynomial method plateaus and stops improving.

## What I take away from it

The theorem survives everything I threw at it, but survival isn't the takeaway the 60% is. The bound isn't just asymptotically right with some mystery slack in front. A trained network uses a fixed, predictable fraction of it, at least for these targets, and that's a more useful fact than the rate on its own.

Which changes the question worth asking. Not "can a network approximate this function," because for anything with finite Barron norm the answer is yes and it's boring. The question is "what is the Barron norm," because you can compute it in closed form, read off how it scales with dimension, and get a rough width before you've trained a single epoch.

Repo: [github.com/Sid-WC121/barron-constant](https://github.com/Sid-WC121/barron-constant)

## References

:::bibtex
@ARTICLE{256500,
  author={Barron, A.R.},
  journal={IEEE Transactions on Information Theory},
  title={Universal approximation bounds for superpositions of a sigmoidal function},
  year={1993},
  volume={39},
  number={3},
  pages={930-945},
  keywords={Artificial neural networks;Fourier transforms;Approximation error;Feeds;Linear approximation;Neural networks;Feedforward neural networks;Information theory;Statistics;Statistical distributions},
  doi={10.1109/18.256500}}
:::
